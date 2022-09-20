// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { fmt, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Instruction } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Instruction";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";
import { Message } from "../../components/Message/Message";

export const Settlement : React.FC = () => {
  const classes = useStyles();
  const { getName } = useParties();

  const { contracts: instructions, loading: l1 } = useStreamQueries(Instruction);
  const { contracts: clocks, loading: l2 } = useStreamQueries(Clock);

  if (l1 || l2) return (<Spinner />);
  if (clocks.length === 0) return <Message text="No clock found" />

  const filtered = instructions.filter(c => c.payload.step.sender !== c.payload.step.receiver);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Lifecycle Settlement for {clocks[0].payload.clockTime}</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Sender</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Receiver</b></TableCell>
                    <TableCell key={3} className={classes.tableCell} align="right"><b>Quantity</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Version</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{c.payload.id.unpack}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.step.sender)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{getName(c.payload.step.receiver)}</TableCell>
                      <TableCell key={3} className={classes.tableCell} align="right">{fmt(c.payload.step.quantity.amount)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.step.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{shorten(c.payload.step.quantity.unit.version)}</TableCell>
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
