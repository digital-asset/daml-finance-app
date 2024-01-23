// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Button, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { fmt } from "../../util";
import { Trade } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Confirmation/Model";
import { VerticalTable } from "../../components/Table/VerticalTable";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { CreateEvent } from "@daml/ledger";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Confirmation/Service";
import { Factory } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Factory";
import useStyles from "../styles";

export const Confirmation : React.FC = () => {
  const { loading: l1, confirmation } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, contracts: trades } = useStreamQueries(Trade);
  const { loading: l4, contracts: holdingFactories } = useStreamQueries(Factory);

  const navigate = useNavigate();
  const cls = useStyles();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { contractId } = useParams<any>();
  const trade = trades.find(b => b.contractId === contractId);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const confirmTrade = async (c : CreateEvent<Trade>) => {
    if (!confirmation) throw new Error("No confirmation service found");
    const arg = {
      ctrl: party,
      tradeCid : c.contractId,
    }
    const [trdCid, ] = await ledger.exercise(Service.ConfirmTrade, confirmation[0].contractId, arg);
    navigate("/app/confirmation/confirmations/" + trdCid);
  };

  const bookTrade = async (c : CreateEvent<Trade>) => {
    if (!confirmation) throw new Error("No confirmation service found");
    if (!holdingFactories) throw new Error("No holding factory found");
    const arg = {
      holdingFactoryCid : holdingFactories[0].contractId,
    }
    const [ { _1: trdCid }, ]  = await ledger.exercise(Trade.Book, c.contractId, arg);
    navigate("/app/confirmation/confirmations/" + trdCid);
  };

  if (!trade) return <Message text={"Trade [" + contractId + "] not found"} />;
  const instrument = latests.find(c => c.key.id.unpack === trade.payload.instrument.id.unpack);
  if (!instrument || !instrument.assetSwap) return <Message text={"Instrument [" + trade.payload.instrument.id.unpack + "] not found"} />;
  const trs = instrument.assetSwap;

  const tradeHeaders = ["Seller", "Buyer", "Id", "Account", "Instrument", "Notional", "Confirmed", "Status"]
  const tradeValues = [
    getName(trade.payload.seller),
    getName(trade.payload.buyer),
    trade.payload.id,
    trade.payload.account.id.unpack,
    trade.payload.instrument.id.unpack,
    fmt(trade.payload.amount),
    trade.payload.confirmed.map(getName).join(", "),
    trade.payload.status,
  ];

  const sf = trs.payload.asset.periodicSchedule.frequency;
  const instrumentHeaders = ["Description", "Currency", "Effective Date", "Reset Frequency", "Termination Date", "Holiday Calendars", "Calendar Data Provider", "Fixed Rate", "Reference Rate", "Day Count Convention"];
  const instrumentValues = [
    trs.payload.asset.description,
    trs.payload.asset.currency.id.unpack,
    trs.payload.asset.periodicSchedule.effectiveDate,
    sf.tag === "Periodic" ? sf.value.period.periodMultiplier + sf.value.period.period : sf.value,
    trs.payload.asset.periodicSchedule.terminationDate,
    trs.payload.asset.holidayCalendarIds.join(", "),
    getName(trs.payload.asset.calendarDataProvider),
    fmt(trs.payload.asset.fixRate, 4),
    trs.payload.asset.floatingRate?.referenceRateId,
    trs.payload.asset.dayCountConvention,
  ];

  const canConfirm = (trade.payload.seller === party || trade.payload.buyer === party) && !trade.payload.confirmed.includes(party);
  const canBook = (trade.payload.operator === party && trade.payload.status === "Confirmed");
  const action = canConfirm
    ? <Button color="primary" size="large" sx={{ mt: 5, width: "100%" }} className={cls.choiceButton} variant="contained" onClick={() => confirmTrade(trade)}>Affirm</Button>
    : (canBook
      ? <Button color="primary" size="large" sx={{ mt: 5, width: "100%" }} className={cls.choiceButton} variant="contained" onClick={() => bookTrade(trade)}>Book</Button>
      : <></>);
  const payoff = <Button color="primary" size="large" sx={{ mt: 5, width: "100%" }} className={cls.choiceButton} variant="contained" onClick={() => navigate("/app/structuring/instruments/" + trs.payload.asset.instrument.id.unpack)}>View Payoff</Button>

  const underlyingHeaders = ["Underlying", "Weight", "Initial Price"];
  const underlyingValues = trs.payload.asset.underlyings.map(u => [
    u.referenceAsset.id.unpack + " (v" + u.referenceAsset.version + ")",
    fmt(u.weight, 8),
    fmt(u.initialPrice, 4)
  ]);
  return (
    <Grid container spacing={4}>
      <Grid item xs={4}>
        <VerticalTable title="Confirmation" variant={"h3"} headers={tradeHeaders} values={tradeValues} />
        {action}
      </Grid>
      <Grid item xs={4}>
        <VerticalTable title="Instrument" variant={"h3"} headers={instrumentHeaders} values={instrumentValues} />
        {payoff}
      </Grid>
      <Grid item xs={4}>
      <HorizontalTable title="Underlyings" variant={"h3"} headers={underlyingHeaders} values={underlyingValues} />
      </Grid>
    </Grid>
  );
};
