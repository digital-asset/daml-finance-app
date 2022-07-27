// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { parseDate } from "../../util";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { Factory } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Instrument/FixedIncome/Bond";
import { RequestOrigination, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { DatePicker } from "@mui/lab";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { claimToNode, nodeToClaim } from "../../components/Claims/util";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { PeriodEnum } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Data/RollConvention";
import { BusinessDayConventionEnum } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Data/HolidayCalendar";

export const NewFixedRateBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ coupon, setCoupon ] = useState("");
  const [ couponFrequency, setCouponFrequency ] = useState("Annual");
  const [ currency, setCurrency ] = useState("");
  const [ label, setLabel ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const canRequest = !!issueDate && !!maturityDate && !!coupon && !!couponFrequency && !!currency && !!label;

  const ledger = useLedger();
  const party = useParty();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: assets, loading: l2 } = useStreamQueries(AssetDescription);

  const ids = assets.map(c => c.payload.assetId);
  const labels = ids.map(c => c.label);
  const ccyId = ids.find(id => id.label === currency);

  useEffect(() => {
    if (!issueDate || !maturityDate || !coupon || !ccyId) return;
    const createBond = async () => {
      const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
      const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
      const arg = {
        issueDate: parseDate(issueDate),
        maturityDate: parseDate(maturityDate),
        couponPeriod,
        couponPeriodMultiplier,
        couponPerAnnum: coupon,
        currency: ccyId,
        calendarIds: ["FED"],
        convention: BusinessDayConventionEnum.MODFOLLOWING,
        observers: []
      }
      const [c, ] = await ledger.createAndExercise(Factory.CreateFixedRate, { party }, arg);
      setNode(claimToNode(c));
    };
    createBond();
  }, [ledger, party, issueDate, maturityDate, coupon, couponFrequency, ccyId]);

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
        <Typography variant="h3" className={classes.heading}>New Bond</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
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
                      {ids.map((c, i) => (<MenuItem key={i} value={c.label}>{c.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Instrument</Typography>
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
