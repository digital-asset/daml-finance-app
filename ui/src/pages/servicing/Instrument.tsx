// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Paper, Button, TableHead, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import useStyles from "../styles";
import { Service as Lifecycle } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, C, claimToNode } from "../../components/Claims/util";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { Message } from "../../components/Message/Message";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { parseDateAsTime, shorten } from "../../util";
import { Pending } from "@daml.js/daml-finance-interface-claims/lib/Daml/Finance/Interface/Claims/Types";
import { ExpandMore } from "@mui/icons-material";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";

export const Instrument : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ remaining, setRemaining ] = useState<C | null>(null);
  const [ pending, setPending ] = useState<Pending[]>([]);
  const [ node1, setNode1 ] = useState<ClaimTreeNode | undefined>();
  const [ node2, setNode2 ] = useState<ClaimTreeNode | undefined>();
  const [ expanded, setExpanded ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ effectiveDate, setEffectiveDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");
  const [ amount, setAmount ] = useState("");

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, lifecycle } = useServices();
  const { loading: l2, tokens, equities, getByCid } = useInstruments();
  const { loading: l3, contracts: numericObservables } = useStreamQueries(NumericObservable);
  const { loading: l4, contracts: events } = useStreamQueries(Event);
  const { contractId } = useParams<any>();
  const loading = l1 || l2 || l3 || l4;
  const instrument = getByCid(contractId || "");
  const svc = lifecycle.find(c => c.payload.customer === party);

  useEffect(() => {
    const setClaims = async () => {
      if (loading || !instrument.claim) return;
      if (!svc) throw new Error("Couldn't find lifecycle service");
      const observableCids = numericObservables.map(c => c.contractId);
      const [res, ] = await ledger.exercise(Lifecycle.GetCurrentClaims, svc.contractId, { instrumentCid: instrument.claim.contractId, observableCids })
      const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
      setNode1(claimToNode(claims));
    };
    setClaims();
  }, [ledger, party, instrument, numericObservables, svc, loading]);

  useEffect(() => {
    if (!!remaining) setNode2(claimToNode(remaining));
  }, [remaining]);

  if (loading) return <Spinner />;
  if (!svc) return <Message text={"No lifecycle service found"} />;

  const canDeclareDividend = !!description && !!effectiveDate && !!currency && !!amount;
  const canDeclareStockSplit = !!description && !!effectiveDate && !!amount;
  const canDeclareReplacement = !!description && !!effectiveDate && !!currency && !!amount;

  const previewLifecycle = async () => {
    const observableCids = numericObservables.map(c => c.contractId);
    const [ res, ] = await ledger.exercise(Lifecycle.PreviewLifecycle, svc.contractId, { today: events[0].payload.eventTime, observableCids, instrumentCid: instrument.claim!.contractId });
    const claims = res._1.length > 1 ? and(res._1.map(r => r.claim)) : res._1[0].claim;
    setRemaining(claims);
    setPending(res._2);
  };

  const executeLifecycle = async () => {
    const observableCids = numericObservables.map(c => c.contractId);
    const ruleCid = !!instrument.generic ? svc.payload.genericRuleCid : svc.payload.dynamicRuleCid;
    const arg = {
      ruleCid,
      eventCid: events[0].contractId,
      observableCids,
      instrument: instrument.key
    }
    await ledger.exercise(Lifecycle.Lifecycle, svc.contractId, arg);
    navigate("/app/servicing/effects");
  };

  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };

  const declareDividend = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!instrument.equity || !ccy) throw new Error("Cannot declare dividend on non-equity instrument");
    const arg = {
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: uuidv4() },
      description,
      effectiveTime: parseDateAsTime(effectiveDate),
      perUnitDistribution: [ { amount, unit: ccy.key } ]
    };
    await ledger.exercise(Lifecycle.DeclareDistribution, svc.contractId, arg);
    navigate("/app/servicing/lifecycle");
  };

  const declareStockSplit = async () => {
    if (!instrument.equity) throw new Error("Cannot declare stock split on non-equity instrument");
    const arg = {
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: uuidv4() },
      description,
      effectiveTime: parseDateAsTime(effectiveDate),
      adjustmentFactor: amount
    };
    await ledger.exercise(Lifecycle.DeclareStockSplit, svc.contractId, arg);
    navigate("/app/servicing/lifecycle");
  };

  const declareReplacement = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!instrument.equity || !ccy) throw new Error("Cannot declare replacement on non-equity instrument");
    const arg = {
      equity: instrument.key,
      newVersion: (parseInt(instrument.payload.version) + 1).toString(),
      id: { unpack: uuidv4() },
      description,
      effectiveTime: parseDateAsTime(effectiveDate),
      perUnitReplacement: [ { amount, unit: ccy.key } ]
    };
    await ledger.exercise(Lifecycle.DeclareReplacement, svc.contractId, arg);
    navigate("/app/servicing/lifecycle");
  };

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
                  {!!instrument.claim &&
                  <>
                    <Button color="primary" className={classes.actionButton} variant="contained" disabled={!!remaining} onClick={() => previewLifecycle()}>Preview Lifecycle</Button>
                    <Button color="primary" className={classes.actionButton} variant="contained" disabled={!remaining} onClick={() => executeLifecycle()}>Execute Lifecycle</Button>
                  </>
                  }
                </Paper>
              </Grid>
              <Grid item xs={12}>
                {!!remaining &&
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
                          <TableCell key={0} className={classes.tableCell}>{c.t.substring(0, 10)}</TableCell>
                          <TableCell key={1} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? "Owner" : "Custodian"}</TableCell>
                          <TableCell key={2} className={classes.tableCell}>{parseFloat(c.amount) < 0 ? "Custodian" : "Owner"}</TableCell>
                          <TableCell key={3} className={classes.tableCell}>{(Math.abs(parseFloat(c.amount))).toFixed(5)}</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{c.instrument.id.unpack}</TableCell>
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
              {!!instrument.claim &&
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Current State</Typography>
                  <ClaimsTreeBuilder node={node1} setNode={setNode1} assets={[]} height="30vh"/>
                </Paper>
              </Grid>}
              {!!remaining &&
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Next State</Typography>
                  <ClaimsTreeBuilder node={node2} setNode={setNode2} assets={[]} height="30vh"/>
                </Paper>
              </Grid>}
              {!!instrument.equity &&
              <Grid item xs={12}>
                <Accordion expanded={expanded === "Dividend"} onChange={() => toggle("Dividend")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Dividend</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextInput    label="Description"     value={description}   setValue={setDescription} />
                    <DateInput    label="Effective Date"  value={effectiveDate} setValue={setEffectiveDate} />
                    <SelectInput  label="Currency"        value={currency}      setValue={setCurrency} values={toValues(tokens)} />
                    <TextInput    label="Amount"          value={amount}        setValue={setAmount} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canDeclareDividend} onClick={declareDividend}>Declare Dividend</Button>
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "Stock Split"} onChange={() => toggle("Stock Split")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Stock Split</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextInput    label="Description"       value={description}   setValue={setDescription} />
                    <DateInput    label="Effective Date"    value={effectiveDate} setValue={setEffectiveDate} />
                    <TextInput    label="Adjustment Factor" value={amount}        setValue={setAmount} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canDeclareStockSplit} onClick={declareStockSplit}>Declare StockSplit</Button>
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "Replacement"} onChange={() => toggle("Replacement")}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography gutterBottom variant="h5" component="h2">Replacement</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextInput    label="Description"       value={description}   setValue={setDescription} />
                    <DateInput    label="Effective Date"    value={effectiveDate} setValue={setEffectiveDate} />
                    <SelectInput  label="Replacement Asset" value={currency}      setValue={setCurrency} values={toValues(equities)} />
                    <TextInput    label="Per Unit Amount"   value={amount}        setValue={setAmount} />
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
