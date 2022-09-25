// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, TextFieldProps } from "@mui/material";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import useStyles from "../../styles";
import { parseDate, singleton } from "../../../util";
import { DatePicker } from "@mui/lab";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";

export const NewZeroCouponBond : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ issueDate, setIssueDate ] = useState<Date | null>(null);
  const [ maturityDate, setMaturityDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");

  const canRequest = !!id && !!issueDate && !!maturityDate && !!currency;

  const ledger = useLedger();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();
  const { loading: l2, tokens } = useInstruments();

  if (l1 || l2) return <Spinner />;
  if (structuring.length === 0) return <Message text="No structuring service found" />

  const createFixedRateBond = async () => {
    const ccy = tokens.find(c => c.payload.id.unpack === currency);
    if (!ccy) throw new Error("Couldn't find currency " + currency);
    const arg = {
      id,
      description: id,
      issueDate: parseDate(issueDate),
      maturityDate: parseDate(maturityDate),
      currency: ccy.key,
      observers: emptyMap<string, any>().set("Public", singleton(singleton(getParty("Public")))),
      lastEventTimestamp: new Date().toISOString()
    };
    if (structuringAuto.length > 0) await ledger.exercise(StructuringAuto.RequestAndCreateZeroCouponBond, structuringAuto[0].contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateZeroCouponBond, structuring[0].contractId, arg);
    navigate("/app/structuring/instruments");
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
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                    <Select value={currency} onChange={e => setCurrency(e.target.value as string)} MenuProps={menuProps}>
                      {tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
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
