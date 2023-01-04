// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import useStyles from "../../styles";
import { singleton } from "../../../util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServicesContext";
import { Service as Structuring } from "@daml.js/daml-finance-app-interface-structuring/lib/Daml/Finance/App/Interface/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app-interface-structuring/lib/Daml/Finance/App/Interface/Structuring/Auto";
import { CenteredForm } from "../../../components/CenteredForm/CenteredForm";
import { TextInput } from "../../../components/Form/TextInput";

export const NewToken : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");

  const canRequest = !!id && !!description;

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();

  if (l1) return <Spinner />;

  const createToken = async () => {
    const arg = {
      id: { unpack: id },
      description,
      version: uuidv4(),
      observers: emptyMap<string, any>().set("Public", singleton(getParty("Public"))),
      validAsOf: new Date().toISOString()
    };
    // TODO: Assumes single service
    const svc = structuring.services[0];
    const auto = structuringAuto.services[0];
    if (!svc) throw new Error("No structuring service found for customer [" + party + "]");
    if (!!auto) await ledger.exercise(StructuringAuto.RequestAndCreateToken, auto.service.contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateToken, svc.service.contractId, arg);
    navigate("/app/structuring/instruments");
  };

  return (
    <CenteredForm title= "New Token Instrument">
      <TextInput    label="Id"                      value={id}                    setValue={setId} />
      <TextInput    label="Description"             value={description}           setValue={setDescription} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createToken}>Create Instrument</Button>
    </CenteredForm>
  );
};
