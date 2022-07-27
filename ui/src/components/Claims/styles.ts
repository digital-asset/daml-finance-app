// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  svgHover: {
    "&:hover": {
      fill: "#bbb"
    }
  },
  svgNoMouse: {
    pointerEvents: "none"
  },
}));
