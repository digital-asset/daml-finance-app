// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import useStyles from "../../styles";
import { parseDate, singleton } from "../../../util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServicesContext";
import { Service as Structuring } from "@daml.js/daml-finance-app-interface-structuring/lib/Daml/Finance/App/Interface/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app-interface-structuring/lib/Daml/Finance/App/Interface/Structuring/Auto";
import { CenteredForm } from "../../../components/CenteredForm/CenteredForm";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";
import { DateInput } from "../../../components/Form/DateInput";

export const NewZeroCouponBond : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!id && !!issueDate && !!maturityDate && !!currency;

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();
  const { loading: l2, tokens } = useInstruments();

  if (l1 || l2) return <Spinner />;

  const createZeroCouponBond = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const arg = {
      id: { unpack: id },
      description,
      version: uuidv4(),
      issueDate: parseDate(issueDate),
      maturityDate: parseDate(maturityDate),
      currency: ccy.key,
      observers: emptyMap<string, any>().set("Public", singleton(getParty("Public"))),
      lastEventTimestamp: new Date().toISOString()
    };
    // TODO: Assumes single service
    const svc = structuring.services[0];
    const auto = structuringAuto.services[0];
    if (!svc) throw new Error("No structuring service found for customer [" + party + "]");
    if (!!auto) await ledger.exercise(StructuringAuto.RequestAndCreateZeroCouponBond, auto.service.contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateZeroCouponBond, svc.service.contractId, arg);
    navigate("/app/structuring/instruments");
  };

  return (
    <CenteredForm title= "New Zero Coupon Bond">
      <TextInput    label="Id"            value={id}            setValue={setId} />
      <TextInput    label="Description"   value={description}   setValue={setDescription} />
      <SelectInput  label="Currency"      value={currency}      setValue={setCurrency} values={toValues(tokens)} />
      <DateInput    label="Issue Date"    value={issueDate}     setValue={setIssueDate} />
      <DateInput    label="Maturity Date" value={maturityDate}  setValue={setMaturityDate} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createZeroCouponBond}>Create Instrument</Button>
    </CenteredForm>
    );
};
