// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Account } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Account";
import { useParties } from "../../context/PartiesContext";

export const Accounts : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const { getName } = useParties();

  const { contracts: accounts, loading: l1 } = useStreamQueries(Account);
  if (l1) return (<Spinner />);

  const custodianAccounts = accounts.filter(s => s.payload.custodian === party);
  const ownerAccounts = accounts.filter(s => s.payload.owner === party);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Accounts Held</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Custodian</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Account</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Signatories</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownerAccounts.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.custodian)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.signatories.map(getName).join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Accounts Provided</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Owner</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Account</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Signatories</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {custodianAccounts.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.owner)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.signatories.map(getName).join(", ")}</TableCell>
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
