// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Typography, Grid, Stepper, Step, StepButton } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const [ activeStep, setActiveStep ] = React.useState(0);
  const { key } = useParams<any>();
  const { loading: l1, groups } = useInstruments();
  const group = groups.find(c => c.key === key);

  if (l1) return <Spinner />;
  if (!group) return <Message text={"Group [" + key + "] not found"} />;

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{group.description}</Typography>
        <Stepper nonLinear alternativeLabel activeStep={activeStep} className={classes.timeline}>
          {group.versions.map((inst, i) => (
            <Step key={inst.contractId} completed={false}>
              <StepButton icon={i.toString()} color="inherit" onClick={() => setActiveStep(i)}>
                {inst.payload.validAsOf.substring(0, 10)}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Aggregate instrument={group.versions[activeStep]} />
    </Grid>
  );
};
