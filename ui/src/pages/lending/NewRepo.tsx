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
import { Service as Lending } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service";
import { Message } from "../../components/Message/Message";
import { parseDate } from "../../util";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";

export const NewRepo : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ collateralLabel, setCollateralLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);

  const ledger = useLedger();
  const { loading: l1, lending } = useServices();
  const { loading: l2, equities } = useInstruments();

  const collateral = equities.find(c => c.payload.id.unpack === collateralLabel);
  const canRequest = !!collateralLabel && !!amount && !!maturity && !!collateral;

  if (l1 || l2) return <Spinner />;
  if (!lending) return (<Message text="No lending service found" />);

  const requestRepoOffer = async () => {
    const arg = {
      id: uuidv4(),
      collateral: { amount, unit: collateral!.key },
      maturity: parseDate(maturity)
    };
    await ledger.exercise(Lending.RequestRepoOffer, lending[0].contractId, arg);
    navigate("/app/lending/reporequests");
  }

  return (
    <CenteredForm title= "New Repo Request">
      <SelectInput  label="Collateral Instrument"   value={collateralLabel}         setValue={setCollateralLabel} values={toValues(equities)} />
      <TextInput    label="Amount"                  value={amount}                setValue={setAmount} />
      <DateInput    label="Maturity Date"           value={maturity}              setValue={setMaturity} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestRepoOffer}>Request Offer</Button>
    </CenteredForm>
  );
};
