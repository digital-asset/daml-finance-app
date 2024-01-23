// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { useLedger, useParty } from "@daml/react";
import { Button } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectInput, SelectInputValue, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { Message } from "../../components/Message/Message";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Service";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { ToggleInput } from "../../components/Form/ToggleInput";
import { Side } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Model";

export const NewQuote : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ instrument, setInstrument ] = useState("");
  const [ side, setSide ] = useState("");
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, quoting } = useServices();
  const { loading: l2, latests } = useInstruments();

  const myQuotingServices = quoting.filter(s => s.payload.customer === party);
  const quotableInstruments = latests;
  const quotedInstrument = quotableInstruments.find(c => c.payload.id.unpack === instrument);
  const canRequest = !!instrument && !!quotedInstrument && !!amount;

  if (l1 || l2) return <Spinner />;
  if (myQuotingServices.length === 0) return <Message text={"No quoting service found for customer: " + party} />;

  const requestQuote = async () => {
    if (!quotedInstrument) return;
    const arg = {
      id: { unpack: uuidv4() },
      side: side === "Buy" ? Side.Buy : Side.Sell,
      quantity: { unit: quotedInstrument.key, amount }
    };
    await ledger.exercise(Service.RequestQuote, myQuotingServices[0].contractId, arg);
    navigate("/app/quoting/requests");
  }

  const buySell : SelectInputValue[] = [
    { value: "Buy", display: "Buy" },
    { value: "Sell", display: "Sell" },
  ];

  return (
    <CenteredForm title= "New Quote Request">
      <ToggleInput  label="Side"        value={side}        setValue={setSide}        values={buySell} />
      <SelectInput  label="Instrument"  value={instrument}  setValue={setInstrument}  values={toValues(quotableInstruments)} />
      <TextInput    label="Amount"      value={amount}      setValue={setAmount} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestQuote}>Request Quote</Button>
    </CenteredForm>
  );
};
