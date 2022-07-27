// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from "@mui/material";
import useStyles from "../styles";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { add, and, anytime, at, give, konst, lte, neg, observe, one, or, scale, claimToNode, until, when, zero, nodeToClaim, defaultId } from "../../components/Claims/util";
import { RequestOrigination, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { parseDate } from "../../util";
import { DatePicker } from "@mui/lab";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";

export const NewTurboWarrant : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ isCall, setIsCall ] = useState(true);
  const [ optionType, setOptionType ] = useState("European");
  const [ isCashSettled, setIsCashSettled ] = useState(true);
  const [ underlying, setUnderlying ] = useState("");
  const [ strike, setStrike ] = useState("");
  const [ barrier, setBarrier ] = useState("");
  const [ expiry, setExpiry ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");
  const [ label, setLabel ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const canRequest = !!underlying && !!strike && !!barrier && (optionType === "Perpetual" || !!expiry) && !!currency && !!label;

  const ledger = useLedger();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: assets, loading: l2 } = useStreamQueries(AssetDescription);
  const ids = assets.map(c => c.payload.assetId);
  const labels = ids.map(id => id.label);
  const ccyId = ids.find(id => id.label === currency);
  const undId = ids.find(c => c.label === underlying);

  useEffect(() => {
    const now           = parseDate(new Date());
    const exp           = parseDate(expiry);
    const obsStrike     = konst(strike);
    const obsBarrier    = konst(barrier);
    const obsSpot       = observe(undId || defaultId("Underlying"));
    const obsStrikeNeg  = neg(obsStrike);
    const obsSpotNeg    = neg(obsSpot);
    const obsBarrierGte = lte(obsBarrier, obsSpot);
    const obsBarrierLte = lte(obsSpot, obsBarrier);
    const obsPayoffCash = isCall ? add(obsSpot, obsStrikeNeg) : add(obsStrike, obsSpotNeg);

    const payoutCash        = scale(obsPayoffCash, one(ccyId || defaultId("Currency")));
    const paymentCash       = scale(obsStrike, one(ccyId || defaultId("Currency")));
    const deliveryShare     = give(one(undId || defaultId("Underlying")));
    const deliveryCash      = give(paymentCash);
    const payoutPhys        = and([isCall ? deliveryCash : deliveryShare, isCall ? one(undId || defaultId("Underlying")) : paymentCash]);
    const choice            = or(isCashSettled ? payoutCash : payoutPhys, zero);
    const exerciseEuropean  = when(at(exp), choice);
    const exerciseAmerican  = anytime(at(now), until(at(exp), choice));
    const exercisePerpetual = anytime(at(now), choice);
    const claims            = until(isCall ? obsBarrierLte : obsBarrierGte, optionType === "European" ? exerciseEuropean : (optionType === "American" ? exerciseAmerican : exercisePerpetual));

    setNode(claimToNode(claims));
  }, [expiry, strike, barrier, undId, ccyId, isCall, isCashSettled, optionType]);

  if (l1 || l2) return (<Spinner />);
  if (services.length === 0) return <Message message="No issuance service found" />

  const requestOrigination = async () => {
    if (!node) return;
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
        <Typography variant="h5" className={classes.heading}>New Turbo Warrant</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading} style={{ marginBottom: 0 }}>Details</Typography>
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={isCall} exclusive onChange={(_, v) => { if (v !== null) setIsCall(v); }}>
                    <ToggleButton className={classes.fullWidth} value={true}>Call</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={false}>Put</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={optionType} exclusive onChange={(_, v) => { if (v !== null) setOptionType(v); }}>
                    <ToggleButton className={classes.fullWidth} value={"European"}>European</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"American"}>American</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"Perpetual"}>Perpetual</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={isCashSettled} exclusive onChange={(_, v) => { if (v !== null) setIsCashSettled(v); }}>
                    <ToggleButton className={classes.fullWidth} value={true}>Cash Settlement</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={false}>Physical Settlement</ToggleButton>
                  </ToggleButtonGroup>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Underlying</InputLabel>
                    <Select value={underlying} onChange={e => setUnderlying(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Strike" type="number" value={strike} onChange={e => setStrike(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Barrier" type="number" value={barrier} onChange={e => setBarrier(e.target.value as string)} />

                  {optionType !== "Perpetual" && <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Expiry Date" value={expiry} onChange={e => setExpiry(e)} renderInput={(params) => <TextField fullWidth {...params} />} />}
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Payout Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {assets.map((c, i) => (<MenuItem key={i} value={c.payload.assetId.label}>{c.payload.assetId.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Instrument Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
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
