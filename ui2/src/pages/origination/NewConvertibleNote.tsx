// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel } from "@mui/material";
import useStyles from "../styles";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { render } from "../../components/Claims/render";
import { at, cond, div, konst, lte, mul, observe, one, scale, claimToNode, when } from "../../components/Claims/util";
import { Id } from "@daml.js/daml-finance-app/lib/DA/Finance/Types";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { DatePicker } from "@mui/lab";
import { emptySet, parseDate } from "../../util";

export const NewConvertibleNote : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const el = useRef<HTMLDivElement>(null);

  const [ underlying, setUnderlying ] = useState("");
  const [ principal, setPrincipal ] = useState("");
  const [ currency, setCurrency ] = useState("");
  const [ interest, setInterest ] = useState("");
  const [ discount, setDiscount ] = useState("");
  const [ cap, setCap ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);
  const [ label, setLabel ] = useState("");
  const [ description, setDescription ] = useState("");

  const canRequest = !!underlying && !!principal && !!currency && !!discount && !!interest && !!cap && !!maturity && !!label && !!description;

  const ledger = useLedger();
  const party = useParty();
  const services = useStreamQueries(Service).contracts;
  const customerServices = services.filter(s => s.payload.customer === party);
  const allAssets = useStreamQueries(AssetDescription).contracts;
  const assets = allAssets.filter(c => c.payload.claims.tag === "Zero" && c.payload.assetId.version === "0");
  const ccy = assets.find(c => c.payload.assetId.label === currency);
  const ccyId : Id = ccy?.payload.assetId || { signatories: emptySet(), label: "", version: "0" };
  const asset = assets.find(c => c.payload.assetId.label === underlying);
  const assetId : Id = asset?.payload.assetId || { signatories: emptySet(), label: "", version: "0" };

  const obsPrincipal  = konst((parseFloat(principal || "0") * (1.0 + parseFloat(interest || "0"))).toString());
  const obsCap        = konst(cap);
  const obsDiscount   = konst((1.0 - parseFloat(discount || "0")).toFixed(2));
  const obsSpot       = observe(assetId);
  const obsPayoff     = lte(obsSpot, obsCap);
  const obsDiscounted = mul(obsSpot, obsDiscount);
  const obsConversion = div(obsPrincipal, obsDiscounted);

  const notional    = scale(obsPrincipal, one(ccyId));
  const conversion  = scale(obsConversion, one(assetId));
  const condition   = cond(obsPayoff, conversion, notional);
  const claims      = when(at(parseDate(maturity)), condition);

  useEffect(() => {
    if (!el.current) return;
    el.current.innerHTML = "";
    const data = claimToNode(claims);
    render(el.current, data, 400);
  }, [el, claims]);

  const service = customerServices[0];
  if (!service) return (<></>);

  const requestOrigination = async () => {
    await ledger.exercise(Service.RequestOrigination, service.contractId, { assetLabel: label, description, cfi: { code: "XXXXXX" }, claims, observers: [ service.payload.provider, party ] });
    navigate("/origination/requests");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Convertible Note</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Underlying</InputLabel>
                    <Select value={underlying} onChange={e => setUnderlying(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Principal Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Interest" type="number" value={interest} onChange={e => setInterest(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Cap Price" type="number" value={cap} onChange={e => setCap(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Discount" type="number" value={discount} onChange={e => setDiscount(e.target.value as string)} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturity} onChange={e => setMaturity(e)} renderInput={(params) => <TextField fullWidth {...params} />} />
                  <TextField className={classes.inputField} fullWidth label="Instrument ID" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Payoff</Typography>
                  <div ref={el} style={{ height: "100%" }}/>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
