// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Header } from "../components/Header/Header";
import { useScenario } from "../context/ScenarioContext";
import useStyles from "./styles";

export const Overview : React.FC = () => {
  const classes = useStyles();
  const scenario = useScenario();

  return (
    <>
      <Header/>
      <Grid container direction="column" className={classes.bg}>
        <Grid item xs={12}>
          <Typography variant="h1" className={classes.title}>Welcome to the Daml Finance Demo</Typography>
          <Typography variant="h3" className={classes.subtext}>There are {scenario.selected.apps.length} services available to you.</Typography>
          <Grid container direction="row" spacing={4}>
            {scenario.selected.apps.map(a => a.elem)}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
