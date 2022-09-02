// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";

type BalanceEntry = {
  // providers : string[]
  // owners : string[]
  instrument : string
  version : string
  assets : number
  liabilities : number
  net : number
}

export const Balance : React.FC = () => {
  const classes = useStyles();
  const party = useParty();

  const { contracts: holdings, loading: l1 } = useStreamQueries(Fungible);
  if (l1) return (<Spinner />);

  const assetsAndLiabilities = holdings.filter(c => c.payload.account.custodian === party || c.payload.account.owner === party);
  const assets = assetsAndLiabilities.filter(c => c.payload.account.owner === party);
  const liabilities = assetsAndLiabilities.filter(c => c.payload.account.custodian === party);

  const entries : BalanceEntry[] = [];
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const entry = entries.find(e => e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    if (!!entry) {
      entry.assets += qty;
      entry.net += qty;
    } else {
      entries.push({
        // providers: values(a.payload.custodian),
        // owners: values(a.payload.owner),
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        assets: qty,
        liabilities: 0,
        net: qty
      });
    }
  }
  for (let i = 0; i < liabilities.length; i++) {
    const a = liabilities[i];
    const entry = entries.find(e => e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    if (!!entry) {
      entry.liabilities += qty;
      entry.net -= qty;
    } else {
      entries.push({
        // providers: values(a.payload.custodian),
        // owners: values(a.payload.owner),
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        assets: 0,
        liabilities: qty,
        net: -qty
      });
    }
  }

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Balance</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Instrument</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Version</b></TableCell>
                  <TableCell key={2} className={classes.tableCell} align="right"><b>Assets</b></TableCell>
                  <TableCell key={3} className={classes.tableCell} align="right"><b>Liabilities</b></TableCell>
                  <TableCell key={4} className={classes.tableCell} align="right"><b>Net</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{c.instrument}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{c.version.substring(0, 8)}..</TableCell>
                    <TableCell key={2} className={classes.tableCell} align="right">{fmt(c.assets)}</TableCell>
                    <TableCell key={3} className={classes.tableCell} align="right">{fmt(c.liabilities)}</TableCell>
                    <TableCell key={4} className={classes.tableCell} align="right">{fmt(c.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
