// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, TextFieldProps } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import useStyles from "../../styles";
import { createKey, parseDate, singleton } from "../../../util";
import { RequestAndCreateFixedRateBond, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { DatePicker } from "@mui/lab";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { PeriodEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/RollConvention";
import { emptyMap } from "@daml/types";
import { DayCountConventionEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/DayCount";
import { BusinessDayConventionEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/Calendar";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentsContext";
import { useServices } from "../../../context/ServicesContext";

export const NewFixedRateBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ couponRate, setCouponRate ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ firstCouponDate, setFirstCouponDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ holidayCalendar, setHolidayCalendar ] = useState("");
  const [ dayCountConvention, setDayCountConvention ] = useState("");
  const [ businessDayConvention, setBusinessDayConvention ] = useState("");
  const [ couponFrequency, setCouponFrequency ] = useState("Annual");
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!id && !!couponRate && !!issueDate && !!firstCouponDate && !!maturityDate && !!dayCountConvention && businessDayConvention && !!couponFrequency && !!currency;

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const svc = useServices();
  const inst = useInstruments();

  if (svc.loading || inst.loading) return <Spinner />;
  if (svc.structuringAuto.length === 0) return <Message text="No structuring service found" />

  const createFixedRateBond = async () => {
    const ccy = inst.tokens.find(c => c.payload.id.unpack === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
    const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
    const arg : RequestAndCreateFixedRateBond = {
      id: id,
      couponRate,
      issueDate: parseDate(issueDate),
      firstCouponDate: parseDate(firstCouponDate),
      maturityDate: parseDate(maturityDate),
      holidayCalendarIds: holidayCalendar === "" ? [] : [holidayCalendar],
      calendarDataProvider: party,
      dayCountConvention: dayCountConvention as DayCountConventionEnum,
      businessDayConvention: businessDayConvention as BusinessDayConventionEnum,
      couponPeriod,
      couponPeriodMultiplier,
      currency: createKey(ccy),
      observers: emptyMap<string, any>().set("Public", singleton(singleton(getParty("Public")))),
      lastEventTimestamp: new Date().toISOString()
    }
    await ledger.exercise(Service.RequestAndCreateFixedRateBond, svc.structuringAuto[0].contractId, arg);
    navigate("/structuring/instruments");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Fixed Rate Bond</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Parameters</Typography>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Coupon (per annum)" type="number" value={couponRate} onChange={e => setCouponRate(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {inst.tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
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
                      <MenuItem key={1} value={"Act365Fixed"}>{"Act/365 (Fixed)"}</MenuItem>
                      <MenuItem key={2} value={"Act365L"}>{"Act/365 (L)"}</MenuItem>
                      <MenuItem key={3} value={"ActActAFB"}>{"Act/Act (AFB)"}</MenuItem>
                      <MenuItem key={4} value={"ActActISDA"}>{"Act/Act (ISDA)"}</MenuItem>
                      <MenuItem key={5} value={"ActActICMA"}>{"Act/Act (ICMA)"}</MenuItem>
                      <MenuItem key={6} value={"Basis1"}>{"Basis 1/1"}</MenuItem>
                      <MenuItem key={7} value={"Basis30360"}>{"Basis 30/360"}</MenuItem>
                      <MenuItem key={8} value={"Basis30360ICMA"}>{"Basis 30/360 (ICMA)"}</MenuItem>
                      <MenuItem key={9} value={"Basis30E360"}>{"Basis 30E/360"}</MenuItem>
                      <MenuItem key={10} value={"Basis30E3360"}>{"Basis 30E3/360"}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Business Day Adjustment</InputLabel>
                    <Select value={businessDayConvention} onChange={e => setBusinessDayConvention(e.target.value as string)} MenuProps={menuProps}>
                      <MenuItem key={0} value={"Following"}>{"Following"}</MenuItem>
                      <MenuItem key={1} value={"ModifiedFollowing"}>{"Modified Following"}</MenuItem>
                      <MenuItem key={2} value={"Preceding"}>{"Preceding"}</MenuItem>
                      <MenuItem key={3} value={"ModifiedPreceding"}>{"Modified Preceding"}</MenuItem>
                      <MenuItem key={4} value={"NoAdjustment"}>{"None"}</MenuItem>
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
