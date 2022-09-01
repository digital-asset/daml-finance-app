// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { FixedRateBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/FixedRate";
import { FloatingRateBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/FloatingRate";
import { InflationLinkedBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/InflationLinked";
import { ZeroCouponBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/ZeroCoupon";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, MenuProps, Paper, Select, TextField, Typography } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { createInstrumentKey, createSet } from "../../util";
import useStyles from "../styles";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ tradedInstrumentLabel, setTradedAssetLabel ] = useState("");
  const [ quotedInstrumentLabel, setQuotedAssetLabel ] = useState("");
  const [ id, setId ] = useState("");

  const { getParty } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: autoServices, loading: l2 } = useStreamQueries(AutoService);
  const { contracts: instruments, loading: l3 } = useStreamQueries(Instrument);
  const { contracts: derivatives, loading: l4 } = useStreamQueries(Derivative);
  const { contracts: fixedRateBonds, loading: l5 } = useStreamQueries(FixedRateBond);
  const { contracts: floatingRateBonds, loading: l6 } = useStreamQueries(FloatingRateBond);
  const { contracts: inflationLinkedBonds, loading: l7 } = useStreamQueries(InflationLinkedBond);
  const { contracts: zeroCouponBonds, loading: l8 } = useStreamQueries(ZeroCouponBond);

  const myServices = services.filter(s => s.payload.customer === party);
  const myAutoServices = autoServices.filter(s => s.payload.customer === party);

  const tradableInstruments =
    derivatives.map(createInstrumentKey)
      .concat(
        fixedRateBonds.map(createInstrumentKey)
      )
      .concat(
        floatingRateBonds.map(createInstrumentKey)
      )
      .concat(
        inflationLinkedBonds.map(createInstrumentKey)
      )
      .concat(
        zeroCouponBonds.map(createInstrumentKey)
      )

  const tradedInstrument = tradableInstruments.find(k => k.id.label === tradedInstrumentLabel);
  const quotedInstrument = instruments.find(c => c.payload.id.label === quotedInstrumentLabel);

  const canRequest = !!tradedInstrumentLabel && !!tradedInstrument && !!quotedInstrumentLabel && !!quotedInstrument && !!id;

  if (l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8) return (<Spinner />);
  if (myServices.length === 0) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No listing service found for customer: {party}</h1></div>);

  const requestListing = async () => {
    if (!tradedInstrument || !quotedInstrument) return;
    const arg = {
      id,
      tradedInstrument: tradedInstrument,
      quotedInstrument: createInstrumentKey(quotedInstrument),
      observers : createSet([ getParty("Public") ])
    };
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndCreateListing, myAutoServices[0].contractId, arg);
      navigate("/listing/listings");
    } else {
      await ledger.exercise(Service.RequestCreateListing, myServices[0].contractId, arg);
      navigate("/listing/requests");
    }
  }

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Listing</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <FormControl className={classes.inputField} fullWidth>
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Traded Asset</InputLabel>
                      <Select variant="standard" className={classes.width90} value={tradedInstrumentLabel} onChange={e => setTradedAssetLabel(e.target.value as string)} MenuProps={menuProps}>
                        {tradableInstruments.filter(c => c.id.label !== quotedInstrumentLabel).map((c, i) => (<MenuItem key={i} value={c.id.label}>{c.id.label}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Quoted Asset</InputLabel>
                      <Select variant="standard" fullWidth value={quotedInstrumentLabel} onChange={e => setQuotedAssetLabel(e.target.value as string)} MenuProps={menuProps}>
                        {instruments.filter(c => c.payload.id.label !== tradedInstrumentLabel).map((c, i) => (<MenuItem key={i} value={c.payload.id.label}>{c.payload.id.label}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <TextField variant="standard" className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestListing}>Request Listing</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
