// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Typography, Grid, Stepper, Step, StepButton } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentsContext";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const [ activeStep, setActiveStep ] = React.useState(0);
  const { key } = useParams<any>();
  const { groups, loading } = useInstruments();
  const group = groups.find(c => c.key === key);

  if (loading) return <Spinner />;
  if (!group) return <Message text={"Group [" + key + "] not found"} />;

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{group.description}</Typography>
        <Stepper nonLinear alternativeLabel activeStep={activeStep}>
          {group.versions.map((agg, i) => (
            <Step key={agg.instrument.contractId} completed={false}>
              <StepButton color="inherit" onClick={() => setActiveStep(i)}>
                {agg.instrument.payload.validAsOf}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Grid>
      <Aggregate aggregate={group.versions[activeStep]} />
    </Grid>
  );
};
