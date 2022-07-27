// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel } from "@mui/material";
import useStyles from "../styles";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { add, and, at, div, give, konst, observe, one, scale, sub, claimToNode, when, defaultId, nodeToClaim } from "../../components/Claims/util";
import { RequestOrigination, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { DatePicker } from "@mui/lab";
import { parseDate } from "../../util";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";

export const NewTotalReturnSwap : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ underlying, setUnderlying ] = useState("");
  const [ currency, setCurrency ] = useState("");
  const [ rate, setRate ] = useState("");
  const [ spread, setSpread ] = useState("");
  const [ strike, setStrike ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);
  const [ label, setLabel ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const canRequest = !!underlying && !!currency && !!rate && !!spread && !!strike && !!maturity && !!label;

  const ledger = useLedger();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: assets, loading: l2 } = useStreamQueries(AssetDescription);
  const ids = assets.map(c => c.payload.assetId);
  const labels = ids.map(id => id.label);
  const ccyId = ids.find(id => id.label === currency);
  const undId = ids.find(c => c.label === underlying);
  const rateId = ids.find(c => c.label === rate);

  useEffect(() => {
    const obsInterest   = add(observe(rateId || defaultId("Rate")), konst(spread));
    const obsDiff       = sub(observe(undId || defaultId("Underlying")), konst(strike));
    const obsPayoff     = div(obsDiff, konst(strike));
    const claimFloat  = give(scale(obsInterest, one(ccyId || defaultId("Currency"))));
    const claimEquity = scale(obsPayoff, one(ccyId || defaultId("Currency")));
    const claims      = when(at(parseDate(maturity)), and([claimFloat, claimEquity]));
    setNode(claimToNode(claims));
  }, [spread, strike, undId, ccyId, rateId, maturity]);

  if (l1 || l2) return (<Spinner />);
  if (services.length === 0) return <Message message="No issuance service found" />

  const requestOrigination = async () => {
    if (!node) return;
    console.log(node);
    const arg : RequestOrigination = {
      assetLabel: label,
      description: label,
      cfi: { code: "XXXXXX" },
      claims: nodeToClaim(node, ids),
      observers: [ "Public" ] // TODO: consolidate getting public party somewhere
    }
    await ledger.exercise(Service.RequestOrigination, services[0].contractId, arg);
    navigate("/origination/requests");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Total Return Swap</Typography>
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
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Floating Rate</InputLabel>
                    <Select value={rate} onChange={e => setRate(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Spread" type="number" value={spread} onChange={e => setSpread(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Strike" type="number" value={strike} onChange={e => setStrike(e.target.value as string)} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturity} onChange={e => setMaturity(e)} renderInput={(params) => <TextField fullWidth {...params} />} />
                  <TextField className={classes.inputField} fullWidth label="Instrument Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={labels}/>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
