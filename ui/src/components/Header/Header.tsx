// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { FormControl, MenuItem, Select } from "@mui/material";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Apps from "@mui/icons-material/Apps";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "./styles";
import { useUserDispatch, signOut, loginUser } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import { Spinner } from "../Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useScenario } from "../../context/ScenarioContext";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";

interface HeaderProps {
  app : string
}

export const Header : React.FC<HeaderProps> = ({ app } : HeaderProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const userDispatch = useUserDispatch();
  const branding = useBranding();
  const { getName, getParty, getToken, users } = useParties();
  const party = useParty();
  const scenario = useScenario();
  const [, setError] = useState(false);

  const { contracts: clocks, loading: l1 } = useStreamQueries(Clock);

  const exit = () => {
    signOut(userDispatch);
    if (scenario.selected.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form");
  };

  const changeUser = async (user : string) => {
    const party = getParty(user);
    const token = getToken(party);
    await loginUser(userDispatch, user, party, token, navigate, setError);
  };

  return (
    <AppBar position="fixed" className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        {branding.headerLogo}
        <div className={classes.grow} />
        <Box alignContent="center">
          <Grid container direction="column" alignItems="center">
            <Grid item xs={12}>
            <Typography variant="h5" className={classes.logotype}>Daml Finance</Typography>
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
              <Grid item xs={12}><Typography variant="body2" style={{ color: "#666" }}>Lifecycle date: {new Date(clocks[0].payload.clockTime).toISOString().substring(0, 10)}</Typography></Grid>
            </Grid>
          </Box>
          <Box style={{ width: "120px" }}>
            <Grid container direction="column" alignItems="center">
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select value={getName(party)} onChange={e => changeUser(e.target.value as string)} disableUnderline MenuProps={{ anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } }}>
                    {users.map((c, i) => (<MenuItem key={i} value={c}>{c}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </>}
        <IconButton className={classes.headerMenuButton} color="inherit" onClick={() => navigate("/app")}>
          <Apps classes={{ root: classes.headerIcon }} />
        </IconButton>
        <IconButton className={classes.headerMenuButton} color="inherit" onClick={exit}>
          <ExitToApp classes={{ root: classes.headerIcon }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
