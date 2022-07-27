// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { parseDate } from "../../util";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { claimToNode, nodeToClaim } from "../../components/Claims/util";
import { Spinner } from "../../components/Spinner/Spinner";
import { RequestOrigination, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { DatePicker } from "@mui/lab";
import { Message } from "../../components/Message/Message";
import { Factory } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Instrument/Credit/CreditDefaultSwap";
import { PeriodEnum } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Data/RollConvention";
import { BusinessDayConventionEnum } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Data/HolidayCalendar";

export const NewCds : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ coupon, setCoupon ] = useState("");
  const [ couponFrequency, setCouponFrequency ] = useState("Annual");
  const [ currency, setCurrency ] = useState("");
  const [ underlying, setUnderlying ] = useState("");
  const [ isCashSettled, setIsCashSettled ] = useState(true);
  const [ label, setLabel ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const canRequest = !!issueDate && !!maturityDate && !!coupon && !!couponFrequency && !!currency && !!underlying && !!label;

  const ledger = useLedger();
  const party = useParty();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: assets, loading: l2 } = useStreamQueries(AssetDescription);

  const ids = assets.map(c => c.payload.assetId);
  const labels = ids.map(c => c.label);
  const ccyId = ids.find(id => id.label === currency);
  const undId = ids.find(id => id.label === underlying);

  useEffect(() => {
    if (!issueDate || !maturityDate || !coupon || !ccyId || !undId) return;
    const createCds = async () => {
      const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
      const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
      const arg = {
        issueDate: parseDate(issueDate),
        maturityDate: parseDate(maturityDate),
        couponPeriod,
        couponPeriodMultiplier,
        couponPerAnnum: coupon,
        currency: ccyId,
        underlying: undId,
        defaultProb: { ...undId, label: undId.label + "-DefaultProb" },
        recoveryRate: { ...undId, label: undId.label + "-RecoveryRate" },
        isCashSettled,
        calendarIds: ["FED"],
        convention: BusinessDayConventionEnum.MODFOLLOWING,
        observers: []
      }
      const [c, ] = await ledger.exerciseByKey(Factory.Create, party, arg);
      setNode(claimToNode(c));
    };
    createCds();
  }, [ledger, party, issueDate, maturityDate, coupon, couponFrequency, ccyId, undId, isCashSettled ]);

  if (l1 || l2) return <Spinner />;
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
        <Typography variant="h5" className={classes.heading}>New Credit Default Swap</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Parameters</Typography>
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Issue Date" value={issueDate} onChange={e => setIssueDate(e)} renderInput={(params) => <TextField fullWidth {...params} />} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturityDate} onChange={e => setMaturityDate(e)} renderInput={(params) => <TextField fullWidth {...params} />} />
                  <TextField className={classes.inputField} fullWidth label="Coupon (per annum)" type="number" value={coupon} onChange={e => setCoupon(e.target.value as string)} />
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={couponFrequency} exclusive onChange={(_, v) => { if (v !== null) setCouponFrequency(v); }}>
                    <ToggleButton className={classes.fullWidth} value={"Annual"}>Annual</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"Semi-annual"}>Semi-annual</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"Quarterly"}>Quarterly</ToggleButton>
                  </ToggleButtonGroup>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {labels.map((c, i) => (<MenuItem key={i} value={c}>{c}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Underlying</InputLabel>
                    <Select value={underlying} onChange={e => setUnderlying(e.target.value as string)} MenuProps={menuProps}>
                      {labels.map((c, i) => (<MenuItem key={i} value={c}>{c}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={isCashSettled} exclusive onChange={(_, v) => { if (v !== null) setIsCashSettled(v); }}>
                    <ToggleButton className={classes.fullWidth} value={true}>Cash Settlement</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={false}>Physical Settlement</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Payoff</Typography>
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
