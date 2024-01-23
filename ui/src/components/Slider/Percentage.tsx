// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Slider } from "@mui/material";
import { withStyles } from "@mui/styles";

export const Percentage = withStyles({
  root: {
    paddingTop: "30px",
  },
  active: {},
  valueLabel: {
    top: -22,
    "& *": {
      background: "transparent",
      color: "#203260",
    },
  },
})(Slider);

