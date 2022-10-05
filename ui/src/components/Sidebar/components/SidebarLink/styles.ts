// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  linkButton: {
    width: "100%",
    padding: 15,
    marginLeft: 30,
    borderRadius: 30,
    textTransform: "none"
  },
  actionButton: {
    width: "100%",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    padding: 5,
    marginLeft: 30,
    borderRadius: 30,
    textTransform: "none"
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    height: 58
  },
  linkIcon: {
    height: 32
  },
  linkActive: {
    border: "1px solid"
  },
}));
