// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { parseDate } from "../../util";
import { Factory } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Instrument/FixedIncome/Bond";
import { RequestAndCreateFixedRateBond, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { DatePicker } from "@mui/lab";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { claimToNode, nodeToClaim } from "../../components/Claims/util";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { PeriodEnum } from "@daml.js/f38ad06e09032260fb047a2a5630aade640a09f1a99e7ef77094819ec9478758/lib/Daml/Finance/Common/Date/RollConvention";

export const NewFixedRateBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ label, setLabel ] = useState("");
  const [ couponRate, setCouponRate ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ firstCouponDate, setFirstCouponDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ holidayCalendar, setHolidayCalendar ] = useState("");
  const [ holidayCalendarAgent, setHolidayCalendarAgent ] = useState("");
  const [ dayCountConvection, setDayCountConvention ] = useState("");
  const [ businessDayConvection, setBusinessDayConvention ] = useState("");
  const [ couponFrequency, setCouponFrequency ] = useState("Annual");
  const [ currency, setCurrency ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const canRequest = !!issueDate && !!maturityDate && !!coupon && !!couponFrequency && !!currency && !!label;

  const ledger = useLedger();
  const party = useParty();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: instruments, loading: l2 } = useStreamQueries(Instrument);

  const ids = instruments.map(c => c.payload.id);
  const labels = ids.map(c => c.label);
  const ccyId = ids.find(id => id.label === currency);

//   useEffect(() => {
//     if (!issueDate || !maturityDate || !coupon || !ccyId) return;
//     const createBond = async () => {
//       const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
//       const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
//       const arg = {
//         issueDate: parseDate(issueDate),
//         maturityDate: parseDate(maturityDate),
//         couponPeriod,
//         couponPeriodMultiplier,
//         couponPerAnnum: coupon,
//         currency: ccyId,
//         calendarIds: ["FED"],
//         convention: BusinessDayConventionEnum.MODFOLLOWING,
//         observers: []
//       }
//       const [c, ] = await ledger.exercise(Service.RequestAndCreateFixedRateBond, services[0].contractId, arg);
//       setNode(claimToNode(c));
//     };
//     createBond();
//   }, [ledger, party, issueDate, maturityDate, coupon, couponFrequency, ccyId]);

  if (l1 || l2) return <Spinner />;
  if (services.length === 0) return <Message text="No issuance service found" />

  const createFixedRateBond = async () => {
    if (!node) return;
    const arg : RequestAndCreateFixedRateBond = {
      id: { label, version: uuidv4() },
      couponRate
      issueDate: parseDate(issueDate),
      firstCouponDate: parseDate(issueDate),
      maturityDate: parseDate(issueDate),
      holidayCalendarIds : [Text]
      calendarDataAgency : Party
      dayCountConvention : DayCountConventionEnum
      businessDayConvention : BusinessDayConventionEnum
      couponPeriod : PeriodEnum
      couponPeriodMultiplier : Int
      cashInstrumentCid : Instrument.K
      observers : Observers
      lastEventTimestamp : Time
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
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createFixedRateBond}>Request Origination</Button>
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
