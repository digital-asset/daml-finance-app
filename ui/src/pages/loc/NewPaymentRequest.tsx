// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as LettersOfCredit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Service";
import { Service as MutualTrade } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/MutualTrade/Service";
import { Message } from "../../components/Message/Message";
import { parseDate } from "../../util";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";
import { useParties } from "../../context/PartiesContext";
import { useAccounts } from "../../context/AccountContext";
export const NewPaymentRequest : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const { getParty } = useParties();
  const party = useParty();

  const [ id, setId ] = useState("")
  const [ paymentFor, setPaymentFor ] = useState("")
  const [ currencyLabel, setCurrencyLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ dueDate, setDueDate ] = useState<Date | null>(null);

  const ledger = useLedger();
  const { loading: l1, mutualTrade } = useServices();
  const { loading: l2, tokens } = useInstruments();
  const { loading: l3, accounts } = useAccounts();
  const bankAccount = accounts.find(c=> c.custodian == getParty("CentralBank") && c.owner == party);
  const secAccount = accounts.find(c=> c.custodian == getParty("Issuer") && c.owner == party);
  const currency = tokens.find(c => c.payload.id.unpack === currencyLabel);
  const canRequest = !!currencyLabel && !!amount && !!dueDate && !!id && !!secAccount && !!bankAccount;

  if (l1 || l2) return <Spinner />;
  if (!mutualTrade) return (<Message text="No service found" />);

  const createInvoice = async () => {

    if (!!secAccount && !!bankAccount)
    {
    const arg = {
      id: id,
      paymentFor : paymentFor,
      dueDate: parseDate(dueDate),
      requested: { amount, unit: currency!.key },
      cashAccountKey : bankAccount,
      secAccountKey : secAccount
      
    };
    await ledger.exercise(MutualTrade.CreateInvoice, mutualTrade[0].contractId, arg);
    navigate("/app/loc/invoices");
  }
  }

  return (
    <CenteredForm title= "New Invoice">
      <TextInput    label="Id"                  value={id}                setValue={setId} />
      <TextInput    label="PaymentFor"                  value={paymentFor}                setValue={setPaymentFor} />
      <SelectInput  label="Currency"     value={currencyLabel}         setValue={setCurrencyLabel} values={toValues(tokens)} />
      <TextInput    label="Amount"                  value={amount}                setValue={setAmount} />
      <DateInput    label="Due Date"           value={dueDate}              setValue={setDueDate} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createInvoice}>Create Invoice</Button>
    </CenteredForm>
  );
};
