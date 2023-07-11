// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardMedia, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "./styles";
import gradient from "../../images/gradient.png";

type AppProps = {
  label : string
  description : string
  image : string
  path : string
}

export const App : React.FC<AppProps> = ({ label, description, image, path }) => {
  const classes = useStyles();
  const navigate = useNavigate()

  return (
    <Grid item xs={12} sm={12} md={12} lg={12}>
      <Card className={classes.card}>
        <Box style={{ height: "100%"}}>
          <CardActionArea onClick={() => navigate(path)}>
            <CardMedia className={classes.cardMediaLarge} image={image} title={label} />
            <CardMedia className={classes.cardMediaLargeOverlay} image={gradient} title={label} />
            <Box className={classes.cardMediaText}>
              <Typography className={classes.cardTitle}>{label}</Typography>
              <Typography className={classes.cardText}>{description}</Typography>
            </Box>
          </CardActionArea>
        </Box>
      </Card>
    </Grid>
  );
};
