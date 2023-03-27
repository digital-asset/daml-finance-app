// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, TextField, Button } from "@mui/material";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import useStyles from "../../styles";
import { singleton } from "../../../util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { useInstruments } from "../../../context/InstrumentContext";

export const NewPrivateEquity : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ callInstrument, setCallInstrument] = useState("");

  const canRequest = !!id && !!description;

  const ledger = useLedger();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();
  const { loading: l2, generics } = useInstruments();

  if (l1 || l2) return <Spinner />;
  if (structuring.length === 0) return <Message text="No structuring service found" />

  const createPrivateEquity = async () => {
    const callCcy = generics.find(c => c.payload.id.unpack === callInstrument);
    if (!callCcy) throw new Error("Couldn't find call instrument " + callCcy);
    const arg = {
      id: { unpack: id },
      description,
      observers: emptyMap<string, any>().set("Public", singleton(getParty("Public"))),
      version: "0",
      validAsOf: new Date().toISOString(), 
      called: "0",
      callInstrument: callCcy.key
    };
    if (structuringAuto.length > 0) await ledger.exercise(StructuringAuto.RequestAndCreatePrivateEquity, structuringAuto[0].contractId, arg);
    else await ledger.exercise(Structuring.RequestCreatePrivateEquity, structuring[0].contractId, arg);
    navigate("/app/structuring/instruments");
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Private Equity</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Parameters</Typography>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                  <SelectInput  label="Call Instrument" value={callInstrument}              setValue={setCallInstrument}              values={toValues(generics)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createPrivateEquity}>Create Instrument</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
