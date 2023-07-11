// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Typography, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const { key } = useParams<any>();
  const { loading: l1, groups } = useInstruments();
  const group = groups.find(c => c.key === key);

  if (l1) return <Spinner />;
  if (!group) return <Message text={"Group [" + key + "] not found"} />;

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{group.description}</Typography>
      </Grid>
      <Aggregate instrument={group.versions[0]} />
    </Grid>
  );
};
