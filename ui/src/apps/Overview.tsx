// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";
import { Header } from "../components/Header/Header";
import { useScenario } from "../context/ScenarioContext";

export const Overview : React.FC = () => {
  const classes = useStyles();
  const scenario = useScenario();

  return (
    <>
      <Header app="Portal" />
      <Grid container direction="column" className={classes.bg}>
        <Grid item xs={12}>
          <Grid container direction="row" spacing={4}>
            {scenario.selected.apps}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

const useStyles = makeStyles((theme : Theme) => createStyles({
  bg: {
    backgroundColor: theme.palette.background.default,
    marginTop: 85,
    paddingLeft: 20,
    paddingRight: 20,
  },
}));
