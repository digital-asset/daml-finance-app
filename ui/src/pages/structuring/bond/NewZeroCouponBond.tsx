// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, TextFieldProps } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { createKeyBase, parseDate, singleton } from "../../../util";
import { RequestAndCreateZeroCouponBond, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";
import { DatePicker } from "@mui/lab";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";

export const NewZeroCouponBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ label, setLabel ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!label && !!issueDate && !!maturityDate && !!currency;

  const ledger = useLedger();
  const { getParty } = useParties();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: instruments, loading: l2 } = useStreamQueries(Instrument);

  if (l1 || l2) return <Spinner />;
  if (services.length === 0) return <Message text="No structuring service found" />

  const createFixedRateBond = async () => {
    const ccy = instruments.find(c => c.payload.id.label === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const arg : RequestAndCreateZeroCouponBond = {
      id: { label, version: uuidv4() },
      issueDate: parseDate(issueDate),
      maturityDate: parseDate(maturityDate),
      cashInstrumentCid: createKeyBase(ccy),
      observers: emptyMap<string, any>().set("Public", singleton(singleton(getParty("Public")))),
      lastEventTimestamp: new Date().toISOString()
    }
    await ledger.exercise(Service.RequestAndCreateZeroCouponBond, services[0].contractId, arg);
    navigate("/structuring/instruments");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Zero Coupon Bond</Typography>
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
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {instruments.map((c, i) => (<MenuItem key={i} value={c.payload.id.label}>{c.payload.id.label}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Issue Date" value={issueDate} onChange={setIssueDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturityDate} onChange={setMaturityDate} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
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
