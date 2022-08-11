// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { C, claimToNode } from "../../components/Claims/util";
import { id, version } from "../../util";
import { Effect } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Effect";
import { DateClock, DateClockUpdateEvent } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Time/DateClock";
import { Pending } from "@daml.js/contingent-claims/lib/ContingentClaims/Lifecycle";
import { Time } from "@daml/types";
import { InstrumentKey } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Types";
import { Observation } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Observation";
import { useParties } from "../../hooks/Parties";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const [ remaining, setRemaining ] = useState<C | null>(null);
  const [ pending, setPending ] = useState<Pending<Time, InstrumentKey>[]>([]);
  const [ node1, setNode1 ] = useState<ClaimTreeNode | undefined>();
  const [ node2, setNode2 ] = useState<ClaimTreeNode | undefined>();

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { contracts: derivatives, loading: l1 } = useStreamQueries(Derivative);
  const { contracts: services, loading: l2 } = useStreamQueries(Service);
  const { contracts: observations, loading: l3 } = useStreamQueries(Observation);
  const { contracts: effects, loading: l4 } = useStreamQueries(Effect);
  const { contracts: events, loading: l5 } = useStreamQueries(DateClockUpdateEvent);
  const { contracts: clocks, loading: l6 } = useStreamQueries(DateClock);
  const { contractId } = useParams<any>();

  const cid = contractId?.replace("_", "#");
  const instrument = derivatives.find(c => c.contractId === cid && c.payload.issuer === party);

  useEffect(() => {
    if (!!instrument) setNode1(claimToNode(instrument.payload.claims));
  }, [instrument]);

  useEffect(() => {
    if (!!remaining) setNode2(claimToNode(remaining));
  }, [remaining]);

  if (l1 || l2 || l3 || l4 || l5 || l6) return (<Spinner />);
  if (!instrument) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>Instrument [{cid}] not found</h1></div>);

  const effect = effects.find(c => c.payload.id.includes(instrument.payload.id.label));

  const previewLifecycle = async () => {
    const todayDate = new Date(clocks[0].payload.u.unpack);
    todayDate.setHours(14);
    const today = todayDate.toISOString(); // TODO: Add date control
    const observableCids = observations.map(c => c.contractId);
    const [ res, ] = await ledger.exercise(Service.PreviewLifecycle, services[0].contractId, { today, observableCids, claims: instrument.payload.claims });
    setRemaining(res._1);
    setPending(res._2);
  };

  const executeLifecycle = async () => {
    const observableCids = observations.map(c => c.contractId);
    const arg = {
      ruleName: "Time",
      eventCid: events[0].contractId,
      clockCid: clocks[0].contractId,
      observableCids,
      lifecyclableCid: instrument.contractId
    }
    await ledger.exercise(Service.Lifecycle, services[0].contractId, arg);
  };

  return (
    <Grid container direction="column" spacing={0}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{id(instrument.payload.id)}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Depository</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{getName(instrument.payload.depository)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Issuer</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{getName(instrument.payload.issuer)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Instrument</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{instrument.payload.id.label}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Version</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{version(instrument.payload.id)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={!!remaining || !!effect} onClick={() => previewLifecycle()}>Preview Lifecycle</Button>
                  <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={!remaining || !!effect} onClick={() => executeLifecycle()}>Execute Lifecycle</Button>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                {!!remaining && !effect &&
                <Paper className={classes.paper}>
                  <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Settlement Preview</Typography></Grid>
                  <Table size="small">
                    <TableHead>
                      <TableRow className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Date</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}><b>From</b></TableCell>
                        <TableCell key={2} className={classes.tableCell}><b>To</b></TableCell>
                        <TableCell key={3} className={classes.tableCell}><b>Quantity</b></TableCell>
                        <TableCell key={4} className={classes.tableCell}><b>Asset</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pending.map((c, i) => (
                        <TableRow key={i} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}>{c.t}</TableCell>
                          <TableCell key={1} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? "Counterparty" : getName(instrument.payload.issuer)}</TableCell>
                          <TableCell key={2} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? getName(instrument.payload.issuer) : "Counterparty"}</TableCell>
                          <TableCell key={3} className={classes.tableCell}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{c.asset.id.label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>}
                {!!effect &&
                <Paper className={classes.paper}>
                  <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Lifecycle Effect</Typography></Grid>
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
                          <TableCell key={0} className={classes.tableCellSmall}>Counterparty</TableCell>
                          <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                          <TableCell key={2} className={classes.tableCellSmall}>{getName(effect.payload.provider)}</TableCell>
                          <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.label}</TableCell>
                          <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit.id)}</TableCell>
                        </TableRow>
                      ))}
                      {effect.payload.produced.map((c, i) => (
                        <TableRow key={effect.payload.consumed.length + i} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCellSmall}>{getName(effect.payload.provider)}</TableCell>
                          <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                          <TableCell key={2} className={classes.tableCellSmall}>Counterparty</TableCell>
                          <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.label}</TableCell>
                          <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit.id)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Current State</Typography>
                  <ClaimsTreeBuilder node={node1} setNode={setNode1} assets={[]} height="40vh"/>
                </Paper>
              </Grid>
              {!!remaining &&
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Next State</Typography>
                  <ClaimsTreeBuilder node={node2} setNode={setNode2} assets={[]} height="40vh"/>
                </Paper>
              </Grid>}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
