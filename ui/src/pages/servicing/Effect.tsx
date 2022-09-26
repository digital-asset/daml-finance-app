// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import classnames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useParty, useLedger, useStreamQueries, useQuery } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { fmt, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { keyEquals } from "../../util";
import { Effect as EffectI } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { useParties } from "../../context/PartiesContext";
import { Message } from "../../components/Message/Message";
import { Claim } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Claim";
import { useServices } from "../../context/ServiceContext";
import { HoldingAggregate, useHoldings } from "../../context/HoldingContext";
import { Batch as BatchT } from "@daml.js/daml-finance-settlement/lib/Daml/Finance/Settlement/Batch";
import { Instruction as InstructionT } from "@daml.js/daml-finance-settlement/lib/Daml/Finance/Settlement/Instruction";
import { Batch } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Batch";

export const Effect : React.FC = () => {
  const classes = useStyles();

  useQuery(BatchT);
  useQuery(InstructionT);

  const { getName, getNames } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, custody } = useServices();
  const { loading: l2, holdings } = useHoldings();
  const { loading: l3, contracts: effects } = useStreamQueries(EffectI);
  const { loading: l4, contracts: batches } = useStreamQueries(Batch);
  const loading = l1 || l2 || l3 || l4;

  const { contractId } = useParams<any>();
  const effect = effects.find(c => c.contractId === contractId);

  if (loading) return <Spinner />;
  if (!effect) return <Message text={"Effect [" + contractId + "] not found"} />;
  if (custody.length === 0) return <Message text={"No custody service found"} />;

  const filteredHoldings = holdings.filter(c => keyEquals(c.payload.instrument, effect.payload.targetInstrument));
  const filteredBatches = batches.filter(c => !!c.payload.contextId && c.payload.contextId.unpack === effect.payload.id.unpack);

  const claimEffect = async () => {
    const claimHolding = async (holding : HoldingAggregate) => {
      const service = custody.find(c => c.payload.provider === holding.payload.account.custodian && c.payload.customer === holding.payload.account.owner);
      if (!service) throw new Error("No custody service found with custodian [" + holding.payload.account.custodian + "] and owner [" + holding.payload.account.owner + "]");
      const arg = {
        claimer: party,
        holdingCids: [holding.contractId],
        effectCid: effect.contractId,
        batchId: { unpack: uuidv4() }
      }
      await ledger.exercise(Claim.ClaimEffect, service.payload.claimRuleCid, arg);
    };
    await Promise.all(filteredHoldings.map(claimHolding));
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{effect.payload.description}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Table size="small">
                <TableBody>
                  <TableRow key={0} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Providers</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{getNames(effect.payload.provider)}</TableCell>
                  </TableRow>
                  <TableRow key={1} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Id</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{effect.payload.id.unpack}</TableCell>
                  </TableRow>
                  <TableRow key={2} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Description</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{effect.payload.description}</TableCell>
                  </TableRow>
                  <TableRow key={3} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Target Instrument</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{effect.payload.targetInstrument.id.unpack} ({shorten(effect.payload.targetInstrument.version)})</TableCell>
                  </TableRow>
                  {!!effect.payload.producedInstrument && <TableRow key={4} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellSmall}><b>Produced Instrument</b></TableCell>
                    <TableCell key={1} className={classes.tableCellSmall}>{effect.payload.producedInstrument.id.unpack} ({shorten(effect.payload.producedInstrument.version)})</TableCell>
                  </TableRow>}
                </TableBody>
              </Table>
              <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={filteredHoldings.length === 0 || filteredBatches.length > 0} onClick={() => claimEffect()}>Claim Effect</Button>
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
                      <TableCell key={0} className={classes.tableCellSmall}>Owner</TableCell>
                      <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                      <TableCell key={2} className={classes.tableCellSmall}>Custodian</TableCell>
                      <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                      <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCellSmall}>{shorten(c.unit.version)}</TableCell>
                    </TableRow>
                  ))}
                  {effect.payload.produced.map((c, i) => (
                    <TableRow key={effect.payload.consumed.length + i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCellSmall}>Custodian</TableCell>
                      <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                      <TableCell key={2} className={classes.tableCellSmall}>Owner</TableCell>
                      <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                      <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCellSmall}>{shorten(c.unit.version)}</TableCell>
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
                    <TableCell key={3} className={classes.tableCell} align="right"><b>Position</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHoldings.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.account.custodian)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.account.owner)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.account.id.unpack}</TableCell>
                      <TableCell key={3} className={classes.tableCell} align="right">{fmt(c.payload.amount)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.instrument.id.unpack} ({shorten(c.payload.instrument.version)})</TableCell>
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
                    <TableCell key={1} className={classes.tableCell}><b>Sender</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Receiver</b></TableCell>
                    <TableCell key={3} className={classes.tableCell} align="right"><b>Quantity</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Version</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBatches.flatMap(b => b.payload.steps).filter(s => s.sender !== s.receiver).map((s, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={1} className={classes.tableCell}>{getName(s.sender)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{getName(s.receiver)}</TableCell>
                      <TableCell key={3} className={classes.tableCell} align="right">{fmt(s.quantity.amount)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{s.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{shorten(s.quantity.unit.version)}</TableCell>
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
