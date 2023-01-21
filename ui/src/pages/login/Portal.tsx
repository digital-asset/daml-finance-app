// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import preval from "preval.macro";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Scenario } from "../../components/Card/Scenario";
import { useScenarios } from "../../context/ScenarioContext";
import { useBranding } from "../../context/BrandingContext";
import useStyles from "./styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAdmin } from "../../context/AdminContext";

export const Portal : React.FC = () => {
  const cls = useStyles();
  const branding = useBranding();
  const { loading: l1 } = useAdmin();
  const { loading: l2, scenarios } = useScenarios();

  if (l1 || l2) return <Spinner />;

  return (
    <>
      {branding.background}
      <Typography variant="h1" className={cls.header}>Daml Finance</Typography>
      <Typography variant="h6" className={cls.subHeader}>Select a scenario to start</Typography>
      <Box className={cls.loginContainer} style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, 0%)", width: "90%" }}>
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12} style={{ paddingTop: 0 }}>
            {scenarios.map((s, i) => (<Scenario key={i} scenario={s}/>))}
          </Grid>
        </Grid>
      </Box>
      <Typography fontSize="12px" color="#444" className={cls.versionText}>{process.env.REACT_APP_NAME} v{process.env.REACT_APP_VERSION} ({preval`module.exports = new Date().toISOString();`})</Typography>
    </>
  );
}
