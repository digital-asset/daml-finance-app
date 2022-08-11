// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Fungible } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Fungible";
import { fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";

export type HoldingsProps = {
  showAssets : boolean
}

type PositionEntry = {
  custodian : string
  owner : string
  instrument : string
  version : string
  position : number
  locked : number
  available : number
}

export const Holdings : React.FC<HoldingsProps> = ({ showAssets }) => {
  const classes = useStyles();
  const party = useParty();
  const { getName } = useParties();

  const { contracts: holdings, loading: l1 } = useStreamQueries(Fungible);
  if (l1) return (<Spinner />);

  const filtered = holdings.filter(c => showAssets ? c.payload.account.owner === party : c.payload.account.custodian === party);

  const entries : PositionEntry[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const a = filtered[i];
    const entry = entries.find(e => e.custodian === a.payload.account.custodian && e.owner === a.payload.account.owner && e.instrument === a.payload.instrument.id.label && e.version === a.payload.instrument.id.version);
    const qty = parseFloat(a.payload.amount);
    const isLocked = !!a.payload.lock;
    if (!!entry) {
      entry.position += qty;
      entry.locked += isLocked ? qty : 0;
      entry.available += isLocked ? 0 : qty;
    } else {
      entries.push({
        custodian: a.payload.account.custodian,
        owner: a.payload.account.owner,
        instrument: a.payload.instrument.id.label,
        version: a.payload.instrument.id.version,
        position: qty,
        locked: isLocked ? qty : 0,
        available: isLocked ? 0 : qty
      });
    }
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">{showAssets ? "Assets" : "Liabilities"}</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Custodian</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Owner</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={4} className={classes.tableCell} align="right"><b>Position</b></TableCell>
                    <TableCell key={5} className={classes.tableCell} align="right"><b>Locked</b></TableCell>
                    <TableCell key={6} className={classes.tableCell} align="right"><b>Available</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.custodian)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.owner)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.instrument}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.version}</TableCell>
                      <TableCell key={4} className={classes.tableCell} align="right">{fmt(c.position)}</TableCell>
                      <TableCell key={5} className={classes.tableCell} align="right">{fmt(c.locked)}</TableCell>
                      <TableCell key={6} className={classes.tableCell} align="right">{fmt(c.available)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
