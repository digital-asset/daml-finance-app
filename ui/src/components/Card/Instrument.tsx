// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "./styles";

type InstrumentProps = {
  label : string
  path : string
}

export const Instrument : React.FC<InstrumentProps> = ({ label, path }) => {
  const classes = useStyles();
  const navigate = useNavigate()

  return (
    <Grid item xs={3}>
      <Card className={classes.card}>
        <Box border={1} borderColor="primary.main">
          <CardActionArea onClick={() => navigate(path)}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2" className={classes.cardText}>{label}</Typography>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
    </Grid>
  );
};
