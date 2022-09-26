// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  logotype: {
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    fontWeight: 500,
    fontSize: 24,
    whiteSpace: "nowrap",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  appBar: {
    width: "100vw",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: "white"
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    marginRight: 36,
    display: 'none',
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: "white"
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
    fontSize: 28,
    color: theme.palette.text.primary,
  },
  headerIconCollapse: {
    color: theme.palette.text.primary,
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
  userBox: {
    color: "white",
    backgroundColor: "lightgrey",
  },
  inputField: {
    marginTop: 10,
  },
  selectLabel: {
    marginLeft: -14,
    marginTop: 4
  },
}));
