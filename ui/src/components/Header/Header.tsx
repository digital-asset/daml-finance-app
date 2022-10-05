// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button, Icon, Select } from "@mui/material";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Apps from "@mui/icons-material/Apps";
import { useParty } from "@daml/react";
import useStyles from "./styles";
import { useUserDispatch, signOut, loginUser } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import { useParties } from "../../context/PartiesContext";
import { useScenario } from "../../context/ScenarioContext";
import { ActionSelect } from "../Form/ActionSelect";
import Home from "../../images/home.svg";
import Logout from "../../images/logout.svg";


export const Header : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const userDispatch = useUserDispatch();
  const branding = useBranding();
  const { getName, getParty, getToken, users } = useParties();
  const party = useParty();
  const scenario = useScenario();
  const [, setError] = useState(false);

  const logout = () => {
    signOut(userDispatch);
    if (scenario.selected.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form");
  };

  const changeUser = async (user : string) => {
    const party = getParty(user);
    const token = getToken(party);
    await loginUser(userDispatch, user, party, token, navigate, setError);
  };

  const homeIcon = <Icon className={classes.headerIcon}><img src={Home}/></Icon>;
  const logoutIcon = <Icon className={classes.headerIcon}><img src={Logout}/></Icon>;
  return (
    <AppBar position="fixed" className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        {branding.headerLogo}
        <Typography variant="h5" className={classes.logotype}>Finance</Typography>
        <div className={classes.grow} />
        <Box className={classes.userBox}>
          <Typography variant="body1" display="inline">User: </Typography>
          <ActionSelect value={getName(party)} setValue={changeUser} values={users} />
        </Box>
        <Button className={classes.headerButton} size="large" variant="text" startIcon={homeIcon} onClick={() => navigate("/app")}>Home</Button>
        <Button className={classes.headerButton} size="large" variant="text" startIcon={logoutIcon} onClick={logout}>Log out</Button>
      </Toolbar>
    </AppBar>
  );
}
