// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Scenario } from "../../components/Card/Scenario";
import useStyles from "./styles";
import { scenarios } from "../../context/ScenarioContext";
import { useBranding } from "../../context/BrandingContext";

export const Portal : React.FC = () => {
  const classes = useStyles();
  const branding = useBranding();

  return (
    <>
      {branding.background}
      <Typography variant="h1" style={{ textAlign: "center", position: "absolute", top: "5%", left: "50%", transform: "translate(-50%, 0%)" }}>Daml Finance</Typography>
      <Typography variant="h6" style={{ textAlign: "center", position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, 0%)" }}>Select a scenario to start</Typography>
      <Box className={classes.loginContainer} style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px" }}>
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12}>
            <Grid container direction="row" spacing={6}>
              {scenarios.map((s, i) => (<Scenario key={i} {...s} width={4} />))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
