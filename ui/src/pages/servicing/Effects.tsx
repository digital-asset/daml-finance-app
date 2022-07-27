// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, IconButton, Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { createSet, id, keyEquals, parties, setEquals } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { Effect } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Effect";
import { CreateEvent } from "@daml/ledger";
import { Batch, BatchFactory } from "@daml.js/daml-finance-settlement/lib/Daml/Finance/Settlement/Batch";

export const Effects : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const navigate = useNavigate();

  const { contracts: effects, loading: l1 } = useStreamQueries(Effect);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Holding);
  const { contracts: batches, loading: l3 } = useStreamQueries(Batch);
  const { contracts: factories, loading: l4 } = useStreamQueries(BatchFactory);

  if (l1 || l2 || l3 || l4) return (<Spinner />);

  const filtered = effects.filter(c => c.payload.provider.map.has(party));

  const claimAll = async () => {
    const claim = async (effect : CreateEvent<Effect>) => {
      const consumed = holdings.filter(c => keyEquals(c.payload.instrument, effect.payload.consumed[0].unit));
      const arg = {
        actor: createSet([party]),
        instructableCid: factories[0].contractId,
        holdingCids : consumed.map(c => c.contractId)
      }
      await ledger.exercise(Effect.Claim, effect.contractId, arg);
    }
    await Promise.all(effects.map(claim));
    navigate("/servicing/settlement");
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Effects</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Settler</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Target</b></TableCell>
                  <TableCell key={3} className={classes.tableCell}><b>Settlement Date</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Consumed</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Produced</b></TableCell>
                  <TableCell key={6} className={classes.tableCell}><b>Holdings</b></TableCell>
                  <TableCell key={7} className={classes.tableCell}>
                    <Button className={classes.choiceButton} size="large" variant="contained" color="primary" disabled={batches.length > 0} onClick={claimAll}>Claim All</Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{parties(c.payload.provider)}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{parties(c.payload.settler)}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{id(c.payload.targetInstrument.id)}</TableCell>
                    <TableCell key={3} className={classes.tableCell}>{c.payload.settlementDate}</TableCell>
                    <TableCell key={4} className={classes.tableCell}>{c.payload.consumed.length}</TableCell>
                    <TableCell key={5} className={classes.tableCell}>{c.payload.produced.length}</TableCell>
                    <TableCell key={6} className={classes.tableCell}>{holdings.filter(h => c.payload.consumed.map(t => t.unit).some(k => keyEquals(k, h.payload.instrument) && !setEquals(h.payload.account.custodian, h.payload.account.owner))).length}</TableCell>
                    <TableCell key={7} className={classes.tableCell}>
                      <IconButton color="primary" size="small" component="span" onClick={() => navigate("/servicing/effects/" + c.contractId)}>
                        <KeyboardArrowRight fontSize="small"/>
                      </IconButton>
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
