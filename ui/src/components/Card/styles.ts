// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
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
    opacity: theme.palette.mode === "dark" ? 0.75 : 1.0
  },
  cardText: {
    color: theme.palette.text.primary,
  },
  tableRow: {
    height: "auto"
  },
}));
