// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Apps from "@mui/icons-material/Apps";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "./styles";
import { useUserDispatch, signOut } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import { Spinner } from "../Spinner/Spinner";
import { DateClock } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Time/DateClock";
import { useParties } from "../../context/PartiesContext";
import { useScenario } from "../../context/ScenarioContext";

interface HeaderProps {
  app : string
}

export const Header : React.FC<HeaderProps> = ({ app } : HeaderProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const branding = useBranding();
  const userDispatch = useUserDispatch();
  const { getName } = useParties();
  const party = useParty();
  const scenario = useScenario();

  const { contracts: clocks, loading: l1 } = useStreamQueries(DateClock);

  const exit = () => {
    signOut(userDispatch);
    if (scenario.selected.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form");
  };
  
  return (
    <AppBar position="fixed" className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        {branding.headerLogo}
        <div className={classes.grow} />
        <Box alignContent="center">
          <Grid container direction="column" alignItems="center">
            <Grid item xs={12}>
            <Typography variant="h5" className={classes.logotype}>Digital Market Infrastructure</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ color: "#666" }}>{app}</Typography>
            </Grid>
          </Grid>
        </Box>
        <div className={classes.grow} />
        {(l1 || clocks.length === 0) && <Spinner size={30} marginTop={0} />}
        {!l1 && clocks.length > 0 &&
        <>
          <Box style={{ width: "250px" }}>
            <Grid container direction="column" alignItems="center">
              <Grid item xs={12}><Typography variant="body2" style={{ color: "#666" }}>Today date: {new Date().toISOString().substring(0, 10)}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" style={{ color: "#666" }}>Lifecycle date: {clocks[0].payload.u.unpack}</Typography></Grid>
            </Grid>
          </Box>
          <Box className={classes.userBox} style={{ width: "120px" }}>
            <Grid container direction="column" alignItems="center">
              <Grid item xs={12}><Typography variant="caption">{getName(party)}</Typography></Grid>
            </Grid>
          </Box>
        </>}
        <IconButton className={classes.headerMenuButton} color="inherit" onClick={() => navigate("/apps")}>
          <Apps classes={{ root: classes.headerIcon }} />
        </IconButton>
        <IconButton className={classes.headerMenuButton} color="inherit" onClick={exit}>
          <ExitToApp classes={{ root: classes.headerIcon }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
