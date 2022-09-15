// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  card: {
    width: "100%",
    height: "100%"
    // minWidth: 350,
    // maxWidth: 350,
    // marginTop: 20,
  },
  cardMedia: {
    height: 140,
    backgroundColor: "white",
  },
  cardMediaLarge: {
    height: 200,
    backgroundColor: "white",
  },
  cardContent: {
    backgroundColor: theme.palette.primary.main,
  },
  cardText: {
    color: theme.palette.text.primary,
  },
  tableCellMini: {
    verticalAlign: "center",
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 6,
    fontSize: "0.6rem"
  },
  tableRow: {
    height: "auto"
  },
}));
