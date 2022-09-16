// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, C, claimToNode } from "../../components/Claims/util";
import { Pending } from "@daml.js/contingent-claims/lib/ContingentClaims/Lifecycle";
import { Time } from "@daml/types";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Common";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { useServices } from "../../context/ServicesContext";
import { Message } from "../../components/Message/Message";
import { Observable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";
import { Claims } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Util";
import { shorten } from "../../util";

export const Instrument : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ remaining, setRemaining ] = useState<C | null>(null);
  const [ pending, setPending ] = useState<Pending<Time, InstrumentKey>[]>([]);
  const [ node1, setNode1 ] = useState<ClaimTreeNode | undefined>();
  const [ node2, setNode2 ] = useState<ClaimTreeNode | undefined>();

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const svc = useServices();
  const inst = useInstruments();
  const { contracts: observables, loading: l1 } = useStreamQueries(Observable);
  const { contracts: effects, loading: l2 } = useStreamQueries(Effect);
  const { contracts: events, loading: l3 } = useStreamQueries(Event);
  const { contracts: clocks, loading: l4 } = useStreamQueries(Clock);
  const { contractId } = useParams<any>();

  const aggregate = inst.getByCid(contractId || "");

  useEffect(() => {
    const setClaims = async () => {
      const [res, ] = await ledger.createAndExercise(Claims.Get, { party }, { instrumentCid: aggregate.claims!.contractId })
      const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
      setNode1(claimToNode(claims));
    };
    setClaims();
  }, [ledger, party, aggregate]);

  useEffect(() => {
    if (!!remaining) setNode2(claimToNode(remaining));
  }, [remaining]);

  if (l1 || l2 || l3 || l4 || svc.loading || inst.loading) return (<Spinner />);
  if (svc.lifecycle.length === 0) return <Message text={"No lifecycle service found"} />;

  const effect = effects.find(c => c.payload.targetInstrument.id.unpack === aggregate.instrument.payload.id.unpack && c.payload.targetInstrument.version === aggregate.instrument.payload.version);

  const previewLifecycle = async () => {
    const observableCids = observables.map(c => c.contractId);
    const [ res, ] = await ledger.exercise(Service.PreviewLifecycle, svc.lifecycle[0].contractId, { today: clocks[0].payload.clockTime, observableCids, instrumentCid: aggregate.claims!.contractId });
    setRemaining(res._1);
    setPending(res._2);
  };

  const executeLifecycle = async () => {
    const observableCids = observables.map(c => c.contractId);
    const arg = {
      ruleName: "Time",
      eventCid: events[0].contractId,
      clockCid: clocks[0].contractId,
      observableCids,
      lifecyclableCid: aggregate.lifecycle!.contractId
    }
    await ledger.exercise(Service.Lifecycle, svc.lifecycle[0].contractId, arg);
    navigate("/servicing/settlement");
  };

  return (
    <Grid container direction="column" spacing={0}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{aggregate.instrument.payload.description}</Typography>
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
                        <TableCell key={1} className={classes.tableCellSmall}>{getName(aggregate.instrument.payload.depository)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Issuer</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{getName(aggregate.instrument.payload.issuer)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Id</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{aggregate.instrument.payload.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Description</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{aggregate.instrument.payload.description}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Version</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{shorten(aggregate.instrument.payload.version)}</TableCell>
                      </TableRow>
                      <TableRow key={5} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>ValidAsOf</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{aggregate.instrument.payload.validAsOf}</TableCell>
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
                          <TableCell key={1} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? "Owner" : "Custodian"}</TableCell>
                          <TableCell key={2} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? "Custodian" : "Owner"}</TableCell>
                          <TableCell key={3} className={classes.tableCell}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{c.asset.id.unpack}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>}
                {/* TODO: We don't have consumed or produced on the effect interface: https://github.com/digital-asset/daml-finance/issues/147 */}
                {/* {!!effect &&
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
                          <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.unpack}</TableCell>
                          <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit)}</TableCell>
                        </TableRow>
                      ))}
                      {effect.payload.produced.map((c, i) => (
                        <TableRow key={effect.payload.consumed.length + i} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCellSmall}>{getName(effect.payload.provider)}</TableCell>
                          <TableCell key={1} className={classes.tableCellSmall}>{"=>"}</TableCell>
                          <TableCell key={2} className={classes.tableCellSmall}>Counterparty</TableCell>
                          <TableCell key={3} className={classes.tableCellSmall}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCellSmall}>{c.unit.id.unpack}</TableCell>
                          <TableCell key={5} className={classes.tableCellSmall}>{version(c.unit)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>} */}
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
