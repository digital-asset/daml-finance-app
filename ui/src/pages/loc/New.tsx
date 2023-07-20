// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as LettersOfCredit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Service";
import { Message } from "../../components/Message/Message";
import { parseDate } from "../../util";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";
import { useParties } from "../../context/PartiesContext";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const { getParty } = useParties();

  const [ id, setId ] = useState("")
  const [ currencyLabel, setCurrencyLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);

  const ledger = useLedger();
  const { loading: l1, loc } = useServices();
  const { loading: l2, tokens } = useInstruments();

  const currency = tokens.find(c => c.payload.id.unpack === currencyLabel);
  const canRequest = !!currencyLabel && !!amount && !!maturity && !!id;

  if (l1 || l2) return <Spinner />;
  if (!loc) return (<Message text="No lending service found" />);

  const requestLoC = async () => {
    const arg = {
      id: id,
      requested: { amount, unit: currency!.key },
      maturity: parseDate(maturity), 
      beneficiary: getParty("Seller")
    };
    await ledger.exercise(LettersOfCredit.RequestLoC, loc[0].contractId, arg);
    navigate("/app/loc/requests");
  }

  return (
    <CenteredForm title= "New SBLC Request">
      <TextInput    label="Id"                  value={id}                setValue={setId} />
      <SelectInput  label="Currency"     value={currencyLabel}         setValue={setCurrencyLabel} values={toValues(tokens)} />
      <TextInput    label="Amount"                  value={amount}                setValue={setAmount} />
      <DateInput    label="Maturity Date"           value={maturity}              setValue={setMaturity} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestLoC}>Request Offer</Button>
    </CenteredForm>
  );
};
