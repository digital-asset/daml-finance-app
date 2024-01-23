// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import classnames from "classnames";
import { Grid, Paper, Typography } from "@mui/material";
import useStyles from "./styles";

type CenteredFormProps = {
  title : string
}

export const CenteredForm : React.FC<CenteredFormProps> = ({ title, children }) => {
  const cls = useStyles();

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              {children}
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
