// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Header } from "../components/Header/Header";
import { applications, useScenarios } from "../context/ScenarioContext";
import useStyles from "./styles";
import { Spinner } from "../components/Spinner/Spinner";

export const Overview : React.FC = () => {
  const classes = useStyles();
  const { loading, selected } = useScenarios();
  if (loading) return <Spinner />;
  const apps = applications.filter(a => selected.apps.includes(a.name)).map(a => a.element);

  return (
    <>
      <Header/>
      <Grid container direction="column" className={classes.bg}>
        <Grid item xs={12}>
          <Typography variant="h1" className={classes.title}>Welcome to the Daml Finance Portal</Typography>
          <Typography variant="h3" className={classes.subtext}>There are {selected.apps.length} services available to you.</Typography>
          <Grid container direction="row" spacing={4}>
            {apps}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
