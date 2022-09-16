// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, TextFieldProps } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useServices } from "../../context/ServicesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { Service as Lending } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service";
import { Message } from "../../components/Message/Message";
import { parseDate } from "../../util";
import { DatePicker } from "@mui/lab";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ borrowedLabel, setBorrowedLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ maturity, setMaturity ] = useState<Date | null>(null);

  const ledger = useLedger();
  const { loading: l1, lending } = useServices();
  const { loading: l2, tokens } = useInstruments();

  const borrowed = tokens.find(c => c.instrument.payload.id.unpack === borrowedLabel);
  const canRequest = !!borrowedLabel && !!amount && !!maturity && !!borrowed;

  if (l1 || l2) return (<Spinner />);
  if (!lending) return (<Message text="No lending service found" />);

  const requestBorrowOffer = async () => {
    const arg = {
      id: uuidv4(),
      borrowed: { amount, unit: borrowed!.key },
      maturity: parseDate(maturity)
    };
    await ledger.exercise(Lending.RequestBorrowOffer, lending[0].contractId, arg);
    navigate("/lending/requests");
  }

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Borrow Request</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Borrowed Instrument</InputLabel>
                    <Select fullWidth value={borrowedLabel} onChange={e => setBorrowedLabel(e.target.value as string)} MenuProps={menuProps}>
                      {tokens.map((c, i) => (<MenuItem key={i} value={c.instrument.payload.id.unpack}>{c.instrument.payload.id.unpack}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Quantity" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                  <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label="Maturity Date" value={maturity} onChange={setMaturity} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestBorrowOffer}>Request Offer</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
