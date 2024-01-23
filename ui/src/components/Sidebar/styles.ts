// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  drawer: {
    width: 350,
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
    width: "75%",
    padding: 10,
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
}));
