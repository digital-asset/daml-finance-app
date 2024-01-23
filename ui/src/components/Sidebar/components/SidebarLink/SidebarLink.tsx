// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classnames from "classnames";
import useStyles from "./styles";
import { Button, ListItem } from "@mui/material";

type SidebarLinkProps = {
  label : string
  path : string
  action? : boolean
}

export const SidebarLink : React.FC<SidebarLinkProps> = ({ label, path, action } : SidebarLinkProps) =>  {
  const classes = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLinkActive = path && (pathname === path || pathname.indexOf(path) !== -1);
  const clsLink = { root: classnames(classes.linkButton, { [classes.linkActive]: isLinkActive }) };
  const clsAction = { root: classnames(classes.actionButton, { [classes.linkActive]: isLinkActive }) };

  return (
    <ListItem className={classes.listItem}>
      {!!action && <Button variant="contained" disableRipple classes={clsAction} onClick={() => navigate(path)}>{label}</Button>}
      {!action && <Button variant="text" disableRipple classes={clsLink} onClick={() => navigate(path)}>{label}</Button>}

    </ListItem>
  );
}
