// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

const drawerWidth = 300;

export default makeStyles((theme : Theme) => createStyles({
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    zIndex: 0,
    backgroundColor: theme.palette.background.default,
    border: 0
  },
  toolbar: {
    ...theme.mixins.toolbar,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  actionButton: {
    color: theme.palette.primary.main,
    width: "80%",
    padding: 15,
    marginTop: 30,
    marginLeft: 45,
    marginRight: 45,
    marginBottom: 20,
    borderRadius: 30,
    textTransform: "none"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  mobileBackButton: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3) + 1,
    [theme.breakpoints.only("sm")]: {
      marginTop: 6, //theme.spacing(0.625),
    },
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  headerIcon: {
    fontSize: 28,
    color: theme.palette.text.primary,
  },
  headerIconCollapse: {
    color: theme.palette.text.primary,
  },
  headerMenuButton: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  headerMenuButtonCollapse: {
    marginRight: theme.spacing(2),
  },
  headerMenuButtonSandwich: {
    marginLeft: 10,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0
    },
    padding: theme.spacing(0.5),
  },
  sidebarBox: {
    marginTop: 8,
    marginBottom: 8
  }
}));
