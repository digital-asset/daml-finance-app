// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, IconButton, LinearProgress, Typography } from "@mui/material";
import useStyles from "./styles";
import { Scenario as ScenarioDef, useScenario } from "../../context/ScenarioContext";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { useAdmin } from "../../context/AdminContext";

type ScenarioProps = {
  scenario : ScenarioDef
}

export const Scenario : React.FC<ScenarioProps> = ({ scenario }) => {
  const cls = useStyles();
  const navigate = useNavigate()
  const { createParty } = useAdmin();
  const { select, initialize } = useScenario();
  const [ progress, setProgress ] = useState(scenario.isInitialized ? 100 : 0);

  console.log("Scenario [" + scenario.label + "]: " + scenario.isInitialized.toString());
  const selectScenario = () => {
    const s = select(scenario.label);
    if (s.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form")
  };

  useEffect(() => {
    const loadParties = async () => {
      for (var i = 0; i < scenario.parties.length; i++) {
        const p = scenario.parties[i];
        const partyInfo = await createParty(p.party.displayName, p.party.displayName + "-" + scenario.label);
        p.party = partyInfo;
        setProgress(100 * (i+1) / scenario.parties.length);
      };
      scenario.isInitialized = true;
      initialize(scenario);
    };
    if (!scenario.isInitialized) loadParties();
  }, [scenario]);

  return (
    <Box borderRadius={3}>
      <Grid container direction="row" spacing={6} alignItems="center" className={cls.scenarioBox} >
        <Grid item xs={1} className={cls.scenarioItem} />
        <Grid item xs={3} className={cls.scenarioItem} >
          <Typography variant="h4" component="h4">{scenario.label}</Typography>
        </Grid>
        <Grid item xs={3} className={cls.scenarioItem} >
          <Typography variant="body1" component="p">{scenario.description}</Typography>
        </Grid>
        <Grid item xs={2} className={cls.scenarioItem} >
          <LinearProgress variant="determinate" value={progress} />
        </Grid>
        <Grid item xs={1} className={cls.scenarioItem} >
          <Typography variant="body1" component="p">{Math.round(progress)}%</Typography>
        </Grid>
        <Grid item xs={1} className={cls.scenarioItem} >
          <IconButton size="large" color="inherit" disabled={progress < 100} onClick={selectScenario}>
            <PlayArrow fontSize="large" />
          </IconButton>
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </Box>
  );
};
