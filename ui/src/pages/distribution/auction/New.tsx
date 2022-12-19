// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Button } from "@mui/material";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { createSet } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServicesContext";
import { Service as Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/Service";
import { Service as AuctionAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/Auto";
import { useHoldings } from "../../../context/HoldingContext";
import { CenteredForm } from "../../../components/CenteredForm/CenteredForm";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ currencyLabel, setCurrencyLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ floor, setFloor ] = useState("");
  const [ description, setDescription ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const { loading: l1, auction } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();
  const { loading: l3, holdings, getFungible } = useHoldings();
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const instrument = latests.find(c => c.payload.id.unpack === instrumentLabel);
  const currency = tokens.find(c => c.payload.id.unpack === currencyLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myInstrumentLabels = myHoldings.map(c => c.payload.instrument.id.unpack).filter((v, i, a) => a.indexOf(v) === i);
  const myInstruments = latests.filter(a => myInstrumentLabels.includes(a.payload.id.unpack));
  const canRequest = !!instrumentLabel && !!instrument && !!currencyLabel && !!currency && !!description && !!amount && !!floor;

  const requestCreateAuction = async () => {
    if (!instrument || !currency) throw new Error("Instrument or currency not found");
    const collateralCid = await getFungible(party, amount, instrument.key);
    const receivableAccount = accounts.find(c => c.payload.accountView.custodian === currency.payload.depository && c.payload.accountView.owner === party)?.key;
    if (!receivableAccount) throw new Error("Receivable account not found");
    const agent = getParty("Agent"); // TODO: Hard-coded agent party
    const svc = auction.getService(agent, party);
    if (!svc) throw new Error("No auction service found for provider [" + agent + "] and customer [" + party + "]");
  const arg = {
      auctionId: { unpack: uuidv4() },
      description,
      quantity: { amount, unit: instrument.key },
      currency: currency.key,
      floor: floor,
      collateralCid,
      receivableAccount,
      observers: createSet([getParty("Public")])
    };
    if (!!svc.auto) await ledger.exercise(AuctionAuto.RequestAndCreateAuction, svc.auto.contractId, arg);
    else await ledger.exercise(Auction.RequestCreateAuction, svc.service.contractId, arg);
    navigate("/app/distribution/auctions");
  };

  return (
    <CenteredForm title= "New Auction">
      <TextInput    label="Description" value={description}     setValue={setDescription} />
      <SelectInput  label="Instrument"  value={instrumentLabel} setValue={setInstrumentLabel} values={toValues(myInstruments)} />
      <TextInput    label="Amount"      value={amount}          setValue={setAmount} />
      <SelectInput  label="Currency"    value={currencyLabel}   setValue={setCurrencyLabel} values={toValues(tokens)} />
      <TextInput    label="Floor Price" value={floor}           setValue={setFloor} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestCreateAuction}>Create Auction</Button>
    </CenteredForm>
  );
};
