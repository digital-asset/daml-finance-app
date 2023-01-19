// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { SidebarLink } from "./components/SidebarLink/SidebarLink";
import { Entry } from "./Route";
import useStyles from "./styles";
import { Button, Divider } from "@mui/material";
import { ActionSelect } from "../Form/ActionSelect";
import { useScenarios } from "../../context/ScenarioContext";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  app : string
  entries : Entry[]
}

export const Sidebar : React.FC<SidebarProps> = ({ app, entries } : SidebarProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { selected } = useScenarios();

  const links = entries.filter(e => !e.action);
  const actions = entries.filter(e => !!e.action);

  return (
    <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.drawer }} open={true}>
      <div className={classes.toolbar} />
      <List>
        <Button variant="outlined" disableRipple className={classes.actionButton}>
          <ActionSelect value={app} setValue={v => navigate("/app/" + v.toLowerCase())} values={selected.apps.map(a => a.name)} />
        </Button>
        <Divider style={{ marginBottom: 20 }} />
        {links.map(e => <SidebarLink key={e.label} label={e.label} path={e.path} action={e.action} /> )}
        {!!actions && <Divider style={{ marginTop: 20, marginBottom: 10 }} /> }
        {actions.map(e => <SidebarLink key={e.label} label={e.label} path={e.path} action={e.action} /> )}
      </List>
    </Drawer>
  );
}
