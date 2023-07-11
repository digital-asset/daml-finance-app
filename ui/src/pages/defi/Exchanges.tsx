// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Theme } from "@mui/material";
import { Spinner } from "../../components/Spinner/Spinner";
import { makeStyles, createStyles } from "@mui/styles";
import { Dex } from "../../components/Card/Dex";
import { useServices } from "../../context/ServiceContext";

export const Exchanges : React.FC = () => {
  const classes = useStyles();
  const { loading: l1, decentralizedExchange } = useServices();
  if (l1) return (<Spinner />);

  return (
    <Grid container direction="column" className={classes.bg}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={2}>
          {decentralizedExchange.map((c, i) => <Dex key={i} service={c.payload} />)}
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme : Theme) => createStyles({
  bg: {
    backgroundColor: theme.palette.background.default,
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
}));

