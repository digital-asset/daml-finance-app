// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { v4 as uuidv4 } from "uuid";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { useNavigate } from "react-router-dom";
import { HoldingAggregate, useHoldings } from "../../context/HoldingContext";
import { useInstruments } from "../../context/InstrumentContext";
import { fmt } from "../../util";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Service";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";

export const Trades : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, clearing } = useServices();
  const { loading: l2, holdings } = useHoldings();
  const { loading: l3, interestRateSwaps } = useInstruments();
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);
  if (l1 || l2 || l3 || l4) return <Spinner />;

  const swapIds = interestRateSwaps.map(c => c.payload.id.unpack);
  const filtered = holdings.filter(c => swapIds.includes(c.payload.instrument.id.unpack));

  const requestClearing = async (h : HoldingAggregate) => {
    if (!clearing) throw new Error("No clearing service found");
    const clearingAccount = accounts.find(c => c.payload.accountView.custodian === clearing[0].payload.provider && c.payload.accountView.owner === party)?.key;
    if (!clearingAccount) throw new Error("No clearing account found");
    const arg = {
      id: { unpack: uuidv4() },
      holdingCid: h.contractId,
      clearingAccount
    };
    await ledger.exercise(Service.RequestClearing, clearing[0].contractId, arg);
    navigate("/app/clearing/requests");
  };

  const createRow = (c : HoldingAggregate) : any[] => {
    if (!clearing) throw new Error("No clearing service found");
    const clearer = clearing[0].payload.provider;
    const swap = interestRateSwaps.find(irs => irs.payload.id.unpack === c.payload.instrument.id.unpack)!.interestRateSwap!.payload.interestRate;
    const canRequest = c.payload.account.owner !== clearer && c.payload.account.custodian !== clearer && c.payload.account.owner === party;
    return [
      getName(c.payload.account.owner),
      getName(c.payload.account.custodian),
      fmt(c.payload.amount),
      swap.currency.id.unpack,
      fmt(parseFloat(swap.fixRate) * 100, 2) + "%",
      swap.referenceRateId,
      canRequest ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => requestClearing(c)}>Request Clearing</Button> : <></>,
      <DetailButton path={c.contractId} />
    ];
  };

  const headers = ["Party", "Counterparty", "Notional", "Currency", "FixedRate", "FloatingRate", "Action", "Details"]
  const values : any[] = filtered.map(createRow);
  return (
    <HorizontalTable title="Trades" variant={"h3"} headers={headers} values={values} />
  );
};
