// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Scenario } from "../../components/Card/Scenario";
import damlLogin from "../../images/daml-logo-mark-light.png";
import useStyles from "./styles";
import { scenarios } from "../../context/ScenarioContext";

export const Portal : React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <img alt="loginLogo" src={damlLogin} style={{ position: "absolute", top: "10%", left: "50%", transform: "translate(-50%, 0%)", display: "inline-block", zIndex: 0 }} />
      <Typography variant="h2" style={{ textAlign: "center" }}>Daml Finance</Typography>
      <Box className={classes.loginContainer} style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px", backgroundColor: "#f5f5f5" }}>
        <Grid container direction="column">
          <Grid item xs={12}>
            <Grid container direction="row" spacing={4}>
              {scenarios.map((s, i) => (<Scenario key={i} {...s} width={6} />))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
