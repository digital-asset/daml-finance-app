// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import { Typography, Grid, Paper, Button } from "@mui/material";
import useStyles from "../../styles";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { nodeToClaim } from "../../../components/Claims/util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { singleton } from "../../../util";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServicesContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Structuring/Auto";
import { TextInput } from "../../../components/Form/TextInput";

export const NewGeneric : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode>({ id: uuidv4(), tag: "Claim", type: "Claim", children: [] });

  const { getParty } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, structuring, structuringAuto } = useServices();
  const { loading: l2, tokens, equities } = useInstruments();
  if (l1 || l2) return <Spinner />;

  // TODO: What we actually want here is a list of underlyings, which in theory could be anything.
  // But for demo simplicity purposes we keep it to tokens and equities for now.
  const keys = tokens.map(a => a.key).concat(equities.map(a => a.key));

  const requestOrigination = async () => {
    if (!node || node.tag === "Claim") return;
    const claims = nodeToClaim(node);
    const epoch = new Date(1970, 1, 1).toISOString();
    const observers = emptyMap<string, any>().set("Public", singleton(getParty("Public")));
    const arg = {
      id: { unpack: id },
      description,
      claims,
      acquisitionTime: epoch,
      lastEventTimestamp: epoch,
      observers
    };
    // TODO: Assumes single service
    const svc = structuring.services[0];
    const auto = structuringAuto.services[0];
    if (!svc) throw new Error("No structuring service found for customer [" + party + "]");
    if (!!auto) await ledger.exercise(StructuringAuto.RequestAndCreateGeneric, auto.service.contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateGeneric, svc.service.contractId, arg);
    navigate("/app/structuring/instruments");
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>New Generic Instrument</Typography>
      </Grid>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={4} />
        <Grid item xs={4}>
          <TextInput    label="Id"                      value={id}                    setValue={setId} />
          <TextInput    label="Description"             value={description}           setValue={setDescription} />
        </Grid>
        <Grid item xs={4} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={keys} readonly={false} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!node || node.tag === "Claim"} onClick={requestOrigination}>Originate</Button>
      </Grid>
    </Grid>
  );
};
