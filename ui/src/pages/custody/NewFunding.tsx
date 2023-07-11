// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import { Service as CustodyAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Custody/Auto/Service";
import useStyles from "../styles";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { TextInput } from "../../components/Form/TextInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { useAccounts } from "../../context/AccountContext";

export const NewFunding : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const party = useParty();

  const [ amount, setAmount ] = useState("");
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!amount && !!currency;

  const ledger = useLedger();
  const { loading: l1, custodyAuto } = useServices();
  const { loading: l2, tokens } = useInstruments();
  const { loading: l3, getAccount } = useAccounts();

  const cs = custodyAuto.find(c => c.payload.customer === party);

  if (l1 || l2 || l3) return <Spinner />;
  if (!cs) return <Message text="No custody service found" />

  const createDeposit = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const arg = {
      quantity: { unit: ccy.key, amount },
      account: getAccount(ccy.key),
    };
    await ledger.exercise(CustodyAuto.RequestAndDeposit, cs.contractId, arg);
    navigate("/app/registry/nostro");
  };

  return (
    <CenteredForm title= "New Fixed Rate Bond">
      <SelectInput label="Currency" value={currency} setValue={setCurrency} values={toValues(tokens)} />
      <TextInput label="Amount" value={amount} setValue={setAmount} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createDeposit}>Fund Account</Button>
    </CenteredForm>
  );
};
