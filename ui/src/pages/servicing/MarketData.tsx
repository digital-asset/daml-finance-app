// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Observation } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Observation";

export const MarketData : React.FC = () => {
  const classes = useStyles();

  const { contracts: fixings, loading: l1 } = useStreamQueries(Observation);
  if (l1) return (<Spinner />);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Market Data</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Observable</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Date</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Value</b></TableCell>
                    {/* <TableCell key={3} className={classes.tableCell}><b>Currency</b></TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fixings.map((c, i) =>
                    c.payload.observations.entriesArray().map(([date, value], j) => (
                      <TableRow key={i * 10 + j} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}>{c.payload.obsKey}</TableCell>
                        <TableCell key={1} className={classes.tableCell}>{date}</TableCell>
                        <TableCell key={2} className={classes.tableCell}>{value}</TableCell>
                        {/* <TableCell key={3} className={classes.tableCell}>{c.payload.currency.label}</TableCell> */}
                      </TableRow>))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
