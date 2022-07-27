// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Theme } from "@mui/material";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Dex as DexContract } from "@daml.js/daml-finance-app/lib/DeFi/FlashSwap/Dex";
import { Dex } from "../../components/Card/Dex";
import { makeStyles, createStyles } from "@mui/styles";

export const Trading : React.FC = () => {
  const classes = useStyles();

  const { contracts: dexs, loading: l1 } = useStreamQueries(DexContract);
  if (l1) return (<Spinner />);

  return (
    <Grid container direction="column" className={classes.bg}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={2}>
          {dexs.map((c, i) => <Dex key={i} dex={c.payload} />)}
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
