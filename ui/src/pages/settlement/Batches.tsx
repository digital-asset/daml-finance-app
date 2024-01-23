// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, IconButton, Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Batch } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Batch";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Instruction } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Instruction";
import { CreateEvent } from "@daml/ledger";
import { singleton, values } from "../../util";

export const Batches : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getNames } = useParties();

  const { loading: l1, contracts: batches } = useStreamQueries(Batch);
  const { loading: l2, contracts: instructions } = useStreamQueries(Instruction);

  if (l1 || l2) return <Spinner />;

  const canSettle = (c : CreateEvent<Batch>) : boolean => {
    const filtered = instructions.filter(i => i.payload.batchId.unpack === c.payload.id.unpack);
    const ready = filtered.every(i => i.payload.allocation.tag !== "Unallocated" && i.payload.approval.tag !== "Unapproved");
    return ready && values(c.payload.settlers).includes(party);
  };

  const settle = async (c : CreateEvent<Batch>) => {
    await ledger.exercise(Batch.Settle, c.contractId, { actors: singleton(party) });
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Settlement Batches</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Description</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Settlers</b></TableCell>
                  <TableCell key={3} className={classes.tableCell}><b>Steps</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Details</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Action</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{c.payload.id.unpack}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{c.payload.description}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{getNames(c.payload.settlers)}</TableCell>
                    <TableCell key={3} className={classes.tableCell}>{c.payload.routedSteps.length}</TableCell>
                    <TableCell key={4} className={classes.tableCell}>
                      <IconButton color="primary" size="small" component="span" onClick={() => navigate(c.contractId)}>
                        <KeyboardArrowRight fontSize="small"/>
                      </IconButton>
                    </TableCell>
                    <TableCell key={5} className={classes.tableCell}>
                      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={!canSettle(c)} onClick={() => settle(c)}>Settle</Button>
                    </TableCell>
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
