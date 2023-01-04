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
import { useServices } from "../../context/ServicesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as Lending } from "@daml.js/daml-finance-app-interface-lending/lib/Daml/Finance/App/Interface/Lending/Service";
import { parseDate } from "../../util";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ borrowedLabel, setBorrowedLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, lending } = useServices();
  const { loading: l2, equities } = useInstruments();

  const borrowed = equities.find(c => c.payload.id.unpack === borrowedLabel);
  const canRequest = !!borrowedLabel && !!amount && !!maturity && !!borrowed;

  if (l1 || l2) return <Spinner />;

  const requestBorrowOffer = async () => {
    const arg = {
      dealId: { unpack: uuidv4() },
      description: "Loan of " + amount + " " + borrowed!.key.id.unpack + " until " + parseDate(maturity),
      borrowed: { amount, unit: borrowed!.key },
      maturity: parseDate(maturity)
    };
    // TODO: Assumes single service
    const svc = lending.services[0];
    if (!svc) throw new Error("No lending service found for customer [" + party + "]");
    await ledger.exercise(Lending.RequestBorrowOffer, svc.service.contractId, arg);
    navigate("/app/lending/requests");
  }

  return (
    <CenteredForm title= "New Borrow Request">
      <SelectInput  label="Borrowed Instrument"     value={borrowedLabel}         setValue={setBorrowedLabel} values={toValues(equities)} />
      <TextInput    label="Amount"                  value={amount}                setValue={setAmount} />
      <DateInput    label="Maturity Date"           value={maturity}              setValue={setMaturity} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestBorrowOffer}>Request Offer</Button>
    </CenteredForm>
  );
};
