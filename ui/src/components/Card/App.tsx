// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "./styles";

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
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <Card className={classes.card}>
        <Box border={1} borderColor="primary.main" style={{ height: "100%"}}>
          <CardActionArea onClick={() => navigate(path)}>
            <CardMedia className={classes.cardMedia} image={image} title={label} />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2" className={classes.cardText}>{label}</Typography>
              <Typography variant="body2" color="textPrimary" component="p" className={classes.cardText}>{description}</Typography>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
    </Grid>
  );
};
