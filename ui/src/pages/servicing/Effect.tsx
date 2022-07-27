// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import classnames from "classnames";
import { useParty, useLedger, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { fmt, id, setEquals } from "../../util";
import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
import { Spinner } from "../../components/Spinner/Spinner";
import { createSet, keyEquals, parties, version } from "../../util";
import { Effect as EffectContract } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Effect";
import { Batch, BatchFactory } from "@daml.js/daml-finance-settlement/lib/Daml/Finance/Settlement/Batch";

export const Effect : React.FC = () => {
  const classes = useStyles();

  const ledger = useLedger();
  const party = useParty();
  const { contracts: effects, loading: l1 } = useStreamQueries(EffectContract);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Holding);
  const { contracts: factories, loading: l3 } = useStreamQueries(BatchFactory);
  const { contracts: batches, loading: l4 } = useStreamQueries(Batch);
  const { contractId } = useParams<any>();

  const cid = contractId?.replace("_", "#");
  const effect = effects.find(c => c.contractId === cid);

  if (l1 || l2 || l3 || l4) return (<Spinner />);
  if (!effect) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>Effect [{contractId}] not found</h1></div>);

  const filteredHoldings = holdings.filter(c => keyEquals(c.payload.instrument, effect.payload.consumed[0].unit) && !setEquals(c.payload.account.custodian, c.payload.account.owner));
  const filteredBatches = batches.filter(c => c.payload.id === effect.payload.id);

  const claimEffect = async () => {
    const arg = {
      actor: createSet([party]),
      instructableCid: factories[0].contractId,
      holdingCids: filteredHoldings.map(c => c.contractId)
    }
    await ledger.exercise(EffectContract.Claim, effect.contractId, arg);
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{id(effect.payload.targetInstrument.id)}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Table size="small">
                <TableBody>
                  <TableRow key={0} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Provider</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{parties(effect.payload.provider)}</TableCell>
                  </TableRow>
                  <TableRow key={1} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Settler</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{parties(effect.payload.settler)}</TableCell>
                  </TableRow>
                  <TableRow key={2} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Target</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{id(effect.payload.targetInstrument.id)}</TableCell>
                  </TableRow>
                  <TableRow key={3} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Settlement Date</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{effect.payload.settlementDate}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={filteredBatches.length > 0} onClick={() => claimEffect()}>Claim Effect</Button>
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Unit Asset Movements</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>From</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>To</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Quantity</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Version</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {effect.payload.consumed.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCellSmall}>Holder</TableCell>
                      <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                      <TableCell key={2} className={classes.tableCellSmall}>Issuer</TableCell>
                      <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                      <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.label}</TableCell>
                      <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit.id)}</TableCell>
                    </TableRow>
                  ))}
                  {effect.payload.produced.map((c, i) => (
                    <TableRow key={effect.payload.consumed.length + i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCellSmall}>Issuer</TableCell>
                      <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                      <TableCell key={2} className={classes.tableCellSmall}>Holder</TableCell>
                      <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                      <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.label}</TableCell>
                      <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit.id)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Positions</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Custodian</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Owner</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Account</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={6} className={classes.tableCell} align="right"><b>Position</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHoldings.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{parties(c.payload.account.custodian)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{parties(c.payload.account.owner)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.account.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.instrument.id.label}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{version(c.payload.instrument.id)}</TableCell>
                      <TableCell key={6} className={classes.tableCell} align="right">{fmt(c.payload.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          {filteredBatches.length > 0 && <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Settlement</Typography></Grid>
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
                  {filteredBatches.flatMap(b => b.payload.stepsWithInstructionId).filter(s => !setEquals(s._1.sender, s._1.receiver)).map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{c._2}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{parties(c._1.sender)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{parties(c._1.receiver)}</TableCell>
                      <TableCell key={3} className={classes.tableCell} align="right">{fmt(c._1.quantity.amount)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c._1.quantity.unit.id.label}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{version(c._1.quantity.unit.id)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );
};
