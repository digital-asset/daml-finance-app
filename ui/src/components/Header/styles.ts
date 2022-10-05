// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  appBar: {
    width: "100vw",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    color: theme.palette.text.primary
  },
  toolbar: {
    paddingLeft: 0,
    paddingRight: 0,
    minHeight: 68,
    backgroundColor: theme.colors.header
  },
  logotype: {
    color: theme.palette.primary.main,
    marginTop: 8,
    marginLeft: 142,
    fontWeight: 500,
    fontSize: 16,
  },
  userBox: {
    height: 68,
    width: 220,
    padding: 22,
    backgroundColor: theme.palette.background.paper,
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    marginRight: 36,
    display: 'none',
  },
  hide: {
    display: "none",
  },
  grow: {
    flexGrow: 1,
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    height: 36,
    padding: 0,
    paddingRight: 36 + theme.spacing(1.25),
    width: "100%",
  },
  messageContent: {
    display: "flex",
    flexDirection: "column",
  },
  headerMenu: {
    marginTop: theme.spacing(7),
  },
  headerMenuList: {
    display: "flex",
    flexDirection: "column",
  },
  headerMenuItem: {
    "&:hover, &:focus": {
      // backgroundColor: theme.palette.primary.main,
      // color: theme.palette.text.primary,
    },
  },
  headerMenuButton: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  headerMenuButtonCollapse: {
    marginRight: theme.spacing(2),
  },
  headerMenuButtonSandwich: {
    marginLeft: 9,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0
    },
    padding: theme.spacing(0.5),
  },
  headerIcon: {
    height: 42
  },
  headerButton: {
    color: theme.palette.text.primary,
    textTransform: "none"
  },
  profileMenu: {
    minWidth: 265,
  },
  profileMenuUser: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  profileMenuItem: {
    color: theme.palette.text.primary,
  },
  profileMenuIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  profileMenuLink: {
    fontSize: 16,
    textDecoration: "none",
    "&:hover": {
      cursor: "pointer",
    },
  },
  progress: {
    // size: 28,
    color: theme.palette.text.primary, //"rgba(255, 255, 255, 0.35)",
    // margin: theme.spacing(2),
  },
  inputField: {
    marginTop: 10,
  },
  selectLabel: {
    marginLeft: -14,
    marginTop: 4
  },
}));
