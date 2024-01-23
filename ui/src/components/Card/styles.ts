// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : Theme) => createStyles({
  card: {
    width: "100%",
    height: "100%"
  },
  cardTransparent: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.background.paper
  },
  cardMedia: {
    height: 140,
  },
  cardMediaLarge: {
    height: 200,
  },
  cardMediaLargeOverlay: {
    height: 200,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  },
  cardMediaText: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    padding: 15,
  },
  cardTitle: {
    color: theme.palette.primary.main,
    fontSize: 14
  },
  cardText: {
    color: theme.palette.text.primary,
    fontSize: 12
  },
  tableRow: {
    height: "auto"
  },
  tableCellMini: {
    verticalAlign: "center",
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 6,
    fontSize: "0.6rem"
  },
}));
