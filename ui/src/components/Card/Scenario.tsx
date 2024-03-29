// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "./styles";
import { useScenario } from "../../context/ScenarioContext";

type ScenarioProps = {
  label : string
  description : string
  image : string
  width : number
}

export const Scenario : React.FC<ScenarioProps> = ({ label, description, image, width }) => {
  const classes = useStyles();
  const navigate = useNavigate()
  const scenario = useScenario();

  const selectScenario = () => {
    const s = scenario.select(label);
    if (s.useNetworkLogin) navigate("/login/network");
    else navigate("/login/form")
  };

  return (
    <Grid item xs={12} sm={6} md={width} lg={width}>
      <Card className={classes.cardTransparent}>
        <Box border={1} borderColor="lightgrey" style={{ height: "100%" }}>
          <CardActionArea onClick={selectScenario}>
            <CardMedia className={classes.cardMediaLarge} image={image} title={label} />
            <CardContent >
              <Typography gutterBottom variant="h5" component="h2" className={classes.cardText}>{label}</Typography>
              <Typography variant="body2" color="textPrimary" component="p" className={classes.cardText}>{description}</Typography>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
    </Grid>
  );
};
