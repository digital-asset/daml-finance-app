// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Header } from "../components/Header/Header";
import { useScenarios } from "../context/ScenarioContext";
import useStyles from "./styles";
import { App } from "../components/Card/App";
import appStructuring from "../images/app/structuring.png";

export const Overview : React.FC = () => {
  const classes = useStyles();
  const { selected } = useScenarios();

  const elems = selected.apps.map(a => a.elem);
  return (
    <>
      <Header/>
      <Grid container direction="column" className={classes.bg}>
        <Grid item xs={12}>
          <Typography variant="h1" className={classes.title}>Welcome to the Daml Finance Portal</Typography>
          <Typography variant="h3" className={classes.subtext}>There are {selected.apps.length} services available to you.</Typography>
          <Grid container direction="row" spacing={4}>
            <App key={0}  label="Structuring"   description="Structure and design new assets"         image={appStructuring}  path="/app/structuring/instruments" />
            {/* {elems} */}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
