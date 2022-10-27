// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  tableHeader: {
    color: theme.palette.primary.main,
    marginTop: 15,
    marginBottom: 15
  },
  paper: {
    padding: 20,
    marginBottom: 20,
  },
  fullWidth: {
    width: "100%"
  },
}));
