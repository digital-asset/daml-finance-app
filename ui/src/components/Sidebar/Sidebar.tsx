// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import SidebarLink from "./components/SidebarLink/SidebarLink";
import { RouteEntry } from "./RouteEntry";
import useStyles from "./styles";

type SidebarProps = {
  entries : RouteEntry[]
}

export const Sidebar : React.FC<SidebarProps> = ({ entries } : SidebarProps) => {
  const classes = useStyles();

  return (
    <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.drawer }} open={true}>
      <div className={classes.toolbar} />
      <List>
        {entries.map(e =>
          <SidebarLink key={e.label} level={0} {...e} />
            // {!!e.divider && <Divider />}
        )}
      </List>
    </Drawer>
  );
}
