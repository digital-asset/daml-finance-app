// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger, useParty, useQuery, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead, Accordion, AccordionSummary, AccordionDetails, TextField, FormControl, InputLabel, Select, MenuItem, TextFieldProps, MenuProps } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import useStyles from "../styles";
import { Service as Lifecycle } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, C, claimToNode } from "../../components/Claims/util";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { useServices } from "../../context/ServicesContext";
import { Message } from "../../components/Message/Message";
import { Observable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";
import { Effect as EffectT } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Effect";
import { Event as Distribution } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Event/Distribution";
import { Event as Replacement } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Event/Replacement";
import { parseDate, shorten } from "../../util";
import { Pending } from "@daml.js/daml-finance-interface-instrument-generic/lib/Daml/Finance/Interface/Instrument/Generic/Types";
import { ExpandMore } from "@mui/icons-material";
import { DatePicker } from "@mui/lab";

export const Instrument : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ remaining, setRemaining ] = useState<C | null>(null);
  const [ pending, setPending ] = useState<Pending[]>([]);
  const [ node1, setNode1 ] = useState<ClaimTreeNode | undefined>();
  const [ node2, setNode2 ] = useState<ClaimTreeNode | undefined>();
  const [ expanded, setExpanded ] = useState("");
  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ effectiveDate, setEffectiveDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");
  const [ amount, setAmount ] = useState("");

  useQuery(Replacement);
  useQuery(Distribution);
  useQuery(EffectT);

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, lifecycle } = useServices();
  const { loading: l2, tokens, getByCid } = useInstruments();
  const { loading: l3, contracts: observables } = useStreamQueries(Observable);
  const { loading: l4, contracts: effects } = useStreamQueries(Effect);
  const { loading: l5, contracts: events } = useStreamQueries(Event);
  const { loading: l6, contracts: clocks } = useStreamQueries(Clock);
  const { contractId } = useParams<any>();
  const loading = l1 || l2 || l3 || l4 || l5 || l6;
  const instrument = getByCid(contractId || "");

  useEffect(() => {
    const setClaims = async () => {
      if (loading || !lifecycle || !instrument.claims) return;
      const observableCids = observables.map(c => c.contractId);
      const [res, ] = await ledger.exercise(Lifecycle.GetCurrentClaims, lifecycle[0].contractId, { instrumentCid: instrument.claims.contractId, observableCids })
      const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
      setNode1(claimToNode(claims));
    };
    setClaims();
  }, [ledger, party, instrument, observables, lifecycle, loading]);

  useEffect(() => {
    if (!!remaining) setNode2(claimToNode(remaining));
  }, [remaining]);

  if (loading) return (<Spinner />);
  if (lifecycle.length === 0) return <Message text={"No lifecycle service found"} />;

  const canDeclareDividend = !!id && !!description && !!effectiveDate && !!currency && !!amount;
  const canDeclareStockSplit = !!id && !!description && !!effectiveDate && !!amount;
  const canDeclareReplacement = !!id && !!description && !!effectiveDate && !!currency && !!amount;
  const effect = effects.find(c => c.payload.targetInstrument.id.unpack === instrument.payload.id.unpack && c.payload.targetInstrument.version === instrument.payload.version);

  const previewLifecycle = async () => {
    const observableCids = observables.map(c => c.contractId);
    const [ res, ] = await ledger.exercise(Lifecycle.PreviewLifecycle, lifecycle[0].contractId, { today: clocks[0].payload.clockTime, observableCids, instrumentCid: instrument.claims!.contractId });
    const claims = res._1.length > 1 ? and(res._1.map(r => r.claim)) : res._1[0].claim;
    setRemaining(claims);
    setPending(res._2);
  };

  const executeLifecycle = async () => {
    const observableCids = observables.map(c => c.contractId);
    const arg = {
      ruleName: "Time",
      eventCid: events[0].contractId,
      clockCid: clocks[0].contractId,
      observableCids,
      lifecyclableCid: instrument.lifecycle!.contractId
    }
    await ledger.exercise(Lifecycle.Lifecycle, lifecycle[0].contractId, arg);
    navigate("/servicing/effects");
  };

  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };

  const declareDividend = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!lifecycle || !instrument.equity || !ccy) throw new Error("Cannot declare dividend on non-equity instrument");
    const arg = {
      clockCid: clocks[0].contractId,
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: id },
      description,
      effectiveDate: parseDate(effectiveDate),
      perUnitDistribution: [ { amount, unit: ccy.key } ]
    };
    await ledger.exercise(Lifecycle.DeclareDividend, lifecycle[0].contractId, arg);
    navigate("/servicing/effects");
  };

  const declareStockSplit = async () => {
    if (!lifecycle || !instrument.equity) throw new Error("Cannot declare stock split on non-equity instrument");
    const arg = {
      clockCid: clocks[0].contractId,
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: id },
      description,
      effectiveDate: parseDate(effectiveDate),
      adjustmentFactor: amount
    };
    await ledger.exercise(Lifecycle.DeclareStockSplit, lifecycle[0].contractId, arg);
    navigate("/servicing/effects");
  };

  const declareReplacement = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!lifecycle || !instrument.equity || !ccy) throw new Error("Cannot declare replacement on non-equity instrument");
    const arg = {
      clockCid: clocks[0].contractId,
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: id },
      description,
      effectiveDate: parseDate(effectiveDate),
      perUnitReplacement: [ { amount, unit: ccy.key } ]
    };
    await ledger.exercise(Lifecycle.DeclareReplacement, lifecycle[0].contractId, arg);
    navigate("/servicing/effects");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={0}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{instrument.payload.description}</Typography>
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
                        <TableCell key={0} className={classes.tableCellSmall}><b>Id</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{instrument.payload.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Description</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{instrument.payload.description}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>Version</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{shorten(instrument.payload.version)}</TableCell>
                      </TableRow>
                      <TableRow key={5} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCellSmall}><b>ValidAsOf</b></TableCell>
                        <TableCell key={1} className={classes.tableCellSmall}>{instrument.payload.validAsOf}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {!!instrument.lifecycle &&
                  <>
                    <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={!!remaining || !!effect} onClick={() => previewLifecycle()}>Preview Lifecycle</Button>
                    <Button color="primary" size="large" className={classes.actionButton} variant="outlined" disabled={!remaining || !!effect} onClick={() => executeLifecycle()}>Execute Lifecycle</Button>
                  </>
                  }
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
                          <TableCell key={4} className={classes.tableCell}>{c.instrument.id.unpack}</TableCell>
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
              {!!instrument.lifecycle &&
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Current State</Typography>
                  <ClaimsTreeBuilder node={node1} setNode={setNode1} assets={[]} height="40vh"/>
                </Paper>
              </Grid>}
              {!!remaining &&
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Next State</Typography>
                  <ClaimsTreeBuilder node={node2} setNode={setNode2} assets={[]} height="40vh"/>
                </Paper>
              </Grid>}
              {!!instrument.equity &&
              <Grid item xs={12}>
                <Accordion expanded={expanded === "Dividend"} onChange={() => toggle("Dividend")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Dividend</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                    <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                    <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Effective Date" value={effectiveDate} onChange={setEffectiveDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                    <FormControl className={classes.inputField} fullWidth>
                      <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                      <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                        {tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField className={classes.inputField} fullWidth label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canDeclareDividend} onClick={declareDividend}>Declare Dividend</Button>
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "Stock Split"} onChange={() => toggle("Stock Split")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Stock Split</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                    <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                    <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Effective Date" value={effectiveDate} onChange={setEffectiveDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                    <TextField className={classes.inputField} fullWidth label="Adjustment Factor" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canDeclareStockSplit} onClick={declareStockSplit}>Declare StockSplit</Button>
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "Replacement"} onChange={() => toggle("Replacement")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Replacement</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                    <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                    <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Effective Date" value={effectiveDate} onChange={setEffectiveDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                    <FormControl className={classes.inputField} fullWidth>
                      <InputLabel className={classes.selectLabel}>Replacement Asset</InputLabel>
                      <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                        {tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField className={classes.inputField} fullWidth label="Per Unit Replacement" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canDeclareReplacement} onClick={declareReplacement}>Declare Replacement</Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
