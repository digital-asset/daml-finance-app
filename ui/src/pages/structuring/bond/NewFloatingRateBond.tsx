// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, TextFieldProps } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { createKeyBase, parseDate, singleton } from "../../../util";
import { RequestAndCreateFloatingRateBond, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { DatePicker } from "@mui/lab";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { PeriodEnum } from "@daml.js/daml-finance-common/lib/Daml/Finance/Common/Date/RollConvention";
import { emptyMap } from "@daml/types";
import { DayCountConventionEnum } from "@daml.js/daml-finance-common/lib/Daml/Finance/Common/Date/DayCount";
import { BusinessDayConventionEnum } from "@daml.js/daml-finance-common/lib/Daml/Finance/Common/Date/Calendar";
import { useParties } from "../../../context/PartiesContext";

export const NewFloatingRateBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ label, setLabel ] = useState("");
  const [ referenceRateId, setReferenceRateId ] = useState("");
  const [ couponSpread, setCouponSpread ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ firstCouponDate, setFirstCouponDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ holidayCalendar, setHolidayCalendar ] = useState("");
  const [ dayCountConvention, setDayCountConvention ] = useState("");
  const [ businessDayConvention, setBusinessDayConvention ] = useState("");
  const [ couponFrequency, setCouponFrequency ] = useState("Annual");
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!label && !!referenceRateId && !!couponSpread && !!issueDate && !!firstCouponDate && !!maturityDate && !!dayCountConvention && businessDayConvention && !!couponFrequency && !!currency;

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: instruments, loading: l2 } = useStreamQueries(Instrument);

  if (l1 || l2) return <Spinner />;
  if (services.length === 0) return <Message text="No structuring service found" />

  const createFixedRateBond = async () => {
    const ccy = instruments.find(c => c.payload.id.label === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
    const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
    const arg : RequestAndCreateFloatingRateBond = {
      id: { label, version: uuidv4() },
      referenceRateId,
      couponSpread,
      issueDate: parseDate(issueDate),
      firstCouponDate: parseDate(firstCouponDate),
      maturityDate: parseDate(maturityDate),
      holidayCalendarIds: holidayCalendar === "" ? [] : [holidayCalendar],
      calendarDataAgency: party,
      dayCountConvention: dayCountConvention as DayCountConventionEnum,
      businessDayConvention: businessDayConvention as BusinessDayConventionEnum,
      couponPeriod,
      couponPeriodMultiplier,
      cashInstrumentCid: createKeyBase(ccy),
      observers: emptyMap<string, any>().set("Public", singleton(singleton(getParty("Public")))),
      lastEventTimestamp: new Date().toISOString()
    }
    await ledger.exercise(Service.RequestAndCreateFloatingRateBond, services[0].contractId, arg);
    navigate("/structuring/instruments");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Floating Rate Bond</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Parameters</Typography>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Reference Rate Id</InputLabel>
                    <Select value={referenceRateId} onChange={e => setReferenceRateId(e.target.value as string)} MenuProps={menuProps}>
                      <MenuItem key={0} value={"USD/LIBOR/1M"}>{"USD/LIBOR/1M"}</MenuItem>
                      <MenuItem key={1} value={"USD/LIBOR/3M"}>{"USD/LIBOR/3M"}</MenuItem>
                      <MenuItem key={2} value={"USD/LIBOR/6M"}>{"USD/LIBOR/6M"}</MenuItem>
                      <MenuItem key={3} value={"EUR/EURIBOR/1M"}>{"EUR/EURIBOR/1M"}</MenuItem>
                      <MenuItem key={4} value={"EUR/EURIBOR/3M"}>{"EUR/EURIBOR/3M"}</MenuItem>
                      <MenuItem key={5} value={"EUR/EURIBOR/6M"}>{"EUR/EURIBOR/6M"}</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Coupon Spread (per period)" type="number" value={couponSpread} onChange={e => setCouponSpread(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {instruments.map((c, i) => (<MenuItem key={i} value={c.payload.id.label}>{c.payload.id.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Issue Date" value={issueDate} onChange={setIssueDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="First Coupon Date" value={firstCouponDate} onChange={setFirstCouponDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturityDate} onChange={setMaturityDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                  <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={couponFrequency} exclusive onChange={(_, v) => { if (v !== null) setCouponFrequency(v); }}>
                    <ToggleButton className={classes.fullWidth} value={"Annual"}>Annual</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"Semi-annual"}>Semi-annual</ToggleButton>
                    <ToggleButton className={classes.fullWidth} value={"Quarterly"}>Quarterly</ToggleButton>
                  </ToggleButtonGroup>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Day Count Convention</InputLabel>
                    <Select value={dayCountConvention} onChange={e => setDayCountConvention(e.target.value as string)} MenuProps={menuProps}>
                      <MenuItem key={0} value={"Act360"}>{"Act/360"}</MenuItem>
                      <MenuItem key={1} value={"Act365_Fixed"}>{"Act/365 (Fixed)"}</MenuItem>
                      <MenuItem key={2} value={"Basis_30360"}>{"Basis 30/360"}</MenuItem>
                      <MenuItem key={3} value={"Basis_30360_ICMA"}>{"Basis 30/360 (ICMA)"}</MenuItem>
                      <MenuItem key={4} value={"Basis_30E360"}>{"Basis 30E/360"}</MenuItem>
                      <MenuItem key={5} value={"Basis_30E3360"}>{"Basis 30E3/360"}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Business Day Adjustment</InputLabel>
                    <Select value={businessDayConvention} onChange={e => setBusinessDayConvention(e.target.value as string)} MenuProps={menuProps}>
                      <MenuItem key={0} value={"FOLLOWING"}>{"Following"}</MenuItem>
                      <MenuItem key={1} value={"MODFOLLOWING"}>{"Modified Following"}</MenuItem>
                      <MenuItem key={2} value={"PRECEDING"}>{"Preceding"}</MenuItem>
                      <MenuItem key={3} value={"MODPRECEDING"}>{"Modified Preceding"}</MenuItem>
                      <MenuItem key={4} value={"NONE"}>{"None"}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Holiday Calendar</InputLabel>
                    <Select value={holidayCalendar} onChange={e => setHolidayCalendar(e.target.value as string)} MenuProps={menuProps}>
                      <MenuItem key={0} value={"FED"}>{"FED"}</MenuItem>
                    </Select>
                  </FormControl>
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createFixedRateBond}>Create Instrument</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
