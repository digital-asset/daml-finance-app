// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button, Icon } from "@mui/material";
import { useParty } from "@daml/react";
import useStyles from "./styles";
import { useBranding } from "../../context/BrandingContext";
import { useParties } from "../../context/PartiesContext";
import { useScenario } from "../../context/ScenarioContext";
import { ActionSelect } from "../Form/ActionSelect";
import Home from "../../images/home.svg";
import Logout from "../../images/logout.svg";
import { useUser } from "../../context/UserContext";

export const Header : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { login, logout } = useUser();
  const branding = useBranding();
  const { getName, users } = useParties();
  const party = useParty();
  const scenario = useScenario();

  const logoutUser = () => {
    logout();
    if (scenario.selected.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form");
  };

  const changeUser = async (user : string) => {
    login(user);
  };

  const homeIcon = <Icon className={classes.headerIcon}><img alt="" src={Home}/></Icon>;
  const logoutIcon = <Icon className={classes.headerIcon}><img alt="" src={Logout}/></Icon>;
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
        <Button className={classes.headerButton} size="large" variant="text" startIcon={logoutIcon} onClick={logoutUser}>Log out</Button>
      </Toolbar>
    </AppBar>
  );
}
