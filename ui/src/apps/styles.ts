// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  root: {
    display: "flex",
    maxWidth: "100vw",
    overflowX: "hidden",
  },
  content: {
    flexGrow: 1,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    width: `calc(100vw - ${240 + theme.spacing(6)}px)`,
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default
  },
  fakeToolbar: {
    ...theme.mixins.toolbar,
  },
  bg: {
    marginTop: 110,
    paddingLeft: theme.spacing(20),
    paddingRight: theme.spacing(20),
  },
  title: {
    color: theme.palette.primary.main,
    fontSize: 40,
    fontWeight: 700
  },
  subtext: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 30
  }
}));
