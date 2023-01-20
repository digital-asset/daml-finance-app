// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box,  CircularProgress,  Grid, Typography } from "@mui/material";
import useStyles from "./styles";
import { Scenario as ScenarioDef, setups, useScenarios } from "../../context/ScenarioContext";
import { useAdmin } from "../../context/AdminContext";
import { Circular } from "../Progress/Circular";
import { useLedger } from "@daml/react";

type ScenarioProps = {
  scenario : ScenarioDef
}

export const Scenario : React.FC<ScenarioProps> = ({ scenario }) => {
  const cls = useStyles();
  const navigate = useNavigate()
  const ledger = useLedger();
  const { loading: l1, ledgerParties, createParty, runSetup } = useAdmin();
  const { loading: l2, select, initialize } = useScenarios();
  const [ progress, setProgress ] = useState(scenario.isInitialized ? 100 : 0);
  const [ loaded, setLoaded ] = useState(false);

  const selectScenario = () => {
    const s = select(scenario.name);
    if (s.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form")
  };

  useEffect(() => {
    const loadParties = async () => {
      setLoaded(true);
      console.log("Creating parties for scenario " + scenario.name);
      for (var i = 0; i < scenario.parties.length; i++) {
        const p = scenario.parties[i];
        const partyInfo = await createParty(p.party.displayName, p.party.displayName + "-" + scenario.name);
        p.party = partyInfo;
        setProgress(100 * (i+1) / scenario.parties.length);
      };

      console.log("Running scenario " + scenario.name);
      const parties = scenario.parties.map(p => p.party.identifier);
      const info = setups.find(si => si.scenario === scenario.name);
      if (!!info) await runSetup(info.templateId, info.choice, parties);
      else console.log("No setup choice found for scenario " + scenario.name);

      scenario.isInitialized = true;
      initialize(scenario);
      console.log("Scenario " + scenario.name + " is ready");
    };
    if (!l1 && !l2 && !scenario.isInitialized && !loaded) loadParties();
  }, [l1, l2, loaded, scenario, ledger, ledgerParties, initialize, createParty, runSetup]);

  return (
    <Box borderRadius={3} className={cls.scenarioBox} onClick={selectScenario}>
      <Grid container direction="row" spacing={6} alignItems="center" style={{ margin: 0}}>
        <Grid item xs={1} />
        <Grid item xs={3} className={cls.scenarioItem} >
          <Typography variant="h4" component="h4">{scenario.name}</Typography>
        </Grid>
        <Grid item xs={3} className={cls.scenarioItem} >
          <Typography variant="body1" component="p">{scenario.description}</Typography>
        </Grid>
        <Grid item xs={1} className={cls.scenarioItem} >
          <Circular variant="determinate" value={progress}/>
          {progress === 100 && !scenario.isInitialized && <CircularProgress />}
        </Grid>
        <Grid item xs={3} className={cls.scenarioItem} >
          <Typography variant="body1" component="p">{progress === 100 ? (scenario.isInitialized ? "Ready" : "Running scenario...") : "Creating parties..."}</Typography>
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </Box>
  );
};
