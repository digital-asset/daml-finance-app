// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Button } from "@mui/material";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import useStyles from "../../styles";
import { parseDate, singleton } from "../../../util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { PeriodEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/RollConvention";
import { emptyMap } from "@daml/types";
import { DayCountConventionEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/DayCount";
import { BusinessDayConventionEnum } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Date/Calendar";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";
import { DateInput } from "../../../components/Form/DateInput";
import { ToggleInput } from "../../../components/Form/ToggleInput";
import { businessDayConventions, couponFrequencies, dayCountConventions, holidayCalendars, referenceRates } from "./util";

export const NewFloatingRateBond : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
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

  const canRequest = !!id && !!referenceRateId && !!couponSpread && !!issueDate && !!firstCouponDate && !!maturityDate && !!dayCountConvention && businessDayConvention && !!couponFrequency && !!currency;

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();
  const { loading: l2, tokens } = useInstruments();

  if (l1 || l2) return <Spinner />;
  if (structuring.length === 0) return <Message text="No structuring service found" />

  const createFixedRateBond = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const couponPeriod = couponFrequency === "Annual" ? PeriodEnum.Y : PeriodEnum.M;
    const couponPeriodMultiplier = couponFrequency === "Annual" ? "1" : (couponFrequency === "Semi-annual" ? "6" : "3");
    const arg = {
      id,
      description: id,
      referenceRateId,
      couponSpread,
      issueDate: parseDate(issueDate),
      firstCouponDate: parseDate(firstCouponDate),
      maturityDate: parseDate(maturityDate),
      holidayCalendarIds: holidayCalendar === "" ? [] : [holidayCalendar],
      calendarDataProvider: party,
      dayCountConvention: dayCountConvention as DayCountConventionEnum,
      businessDayConvention: businessDayConvention as BusinessDayConventionEnum,
      couponPeriod,
      couponPeriodMultiplier,
      currency: ccy.key,
      observers: emptyMap<string, any>().set("Public", singleton(getParty("Public"))),
      lastEventTimestamp: new Date().toISOString()
    };
    if (structuringAuto.length > 0) await ledger.exercise(StructuringAuto.RequestAndCreateFloatingRateBond, structuringAuto[0].contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateFloatingRateBond, structuring[0].contractId, arg);
    navigate("/app/structuring/instruments");
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={cls.heading}>New Floating Rate Bond</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              <TextInput    label="Id"                          value={id}                    setValue={setId} />
              <SelectInput  label="Currency"                    value={currency}              setValue={setCurrency}              values={toValues(tokens)} />
              <SelectInput  label="Reference Rate"              value={referenceRateId}       setValue={setReferenceRateId}       values={referenceRates} />
              <TextInput    label="Coupon Spread (per period)"  value={couponSpread}          setValue={setCouponSpread} />
              <DateInput    label="Issue Date"                  value={issueDate}             setValue={setIssueDate} />
              <DateInput    label="First Coupon Date"           value={firstCouponDate}       setValue={setFirstCouponDate} />
              <DateInput    label="Maturity Date"               value={maturityDate}          setValue={setMaturityDate} />
              <ToggleInput  label="Coupon Frequency"            value={couponFrequency}       setValue={setCouponFrequency}       values={couponFrequencies} />
              <SelectInput  label="Day Count Convention"        value={dayCountConvention}    setValue={setDayCountConvention}    values={dayCountConventions} />
              <SelectInput  label="Business Day Adjustment"     value={businessDayConvention} setValue={setBusinessDayConvention} values={businessDayConventions} />
              <SelectInput  label="Holiday Calendar"            value={holidayCalendar}       setValue={setHolidayCalendar}       values={holidayCalendars} />
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createFixedRateBond}>Create Instrument</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
