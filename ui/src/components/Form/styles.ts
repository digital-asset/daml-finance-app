// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  inputField: {
    marginTop: 10,
  },
  inputFieldLabel: {
    color: theme.palette.grey[400]
  },
  selectLabel: {
    color: theme.palette.grey[400],
    marginLeft: -14,
    marginTop: 4
  },
  fullWidth: {
    width: "100%"
  },
  actionSelect: {
    "& .MuiSelect-select": {
      paddingLeft: 10,
      paddingRight: 0,
      paddingTop: 1,
      paddingBottom: 0,
      width: 100
    },
    fontWeight: 700,
    color: theme.palette.primary.main
  },
}));
