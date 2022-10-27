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
  tableBody: {
    backgroundColor: theme.palette.background.paper,
  },
  tableRowHeader: {
    height: "auto",
  },
  tableRow: {
    height: "auto",
    borderBottom: "1px solid " + theme.palette.secondary.main,
    "&:last-child": {
      borderBottom: "0px"
    },
  },
  tableCell: {
    verticalAlign: "center",
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: "14px",
    borderBottom: "0px"
  },
  tableCellSmall: {
    verticalAlign: "center",
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: "0.7rem"
  },
  actionBox: {
    backgroundColor: theme.palette.background.paper,
    padding: 10,
    borderRadius: 5
  },
  actionButton: {
    marginLeft: 15,
    marginBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 0
  },
  selectBox: {
    color: theme.palette.text.primary
  }
}));
