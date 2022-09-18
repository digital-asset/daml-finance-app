// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import classnames from "classnames";
import { Typography, Grid, Stepper, Step, StepButton, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentsContext";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";
import { shorten } from "../../util";

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
        <Paper className={classnames(classes.fullWidth, classes.paper)}>
          <Stepper nonLinear alternativeLabel activeStep={activeStep}>
            {group.versions.map((inst, i) => (
              <Step key={inst.contractId} completed={false}>
                <StepButton icon={shorten(inst.payload.version)} color="inherit" onClick={() => setActiveStep(i)}>
                  {inst.payload.validAsOf.substring(0, 10)}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Grid>
      <Aggregate instrument={group.versions[activeStep]} />
    </Grid>
  );
};
