// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { useLedger, useParty } from "@daml/react";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, MenuProps, Paper, Select, TextField, Typography } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentsContext";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
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
  const inst = useInstruments();

  const svc = useServices();
  const myListingServices = svc.listing.filter(s => s.payload.customer === party);
  const myAutoListingServices = svc.listingAuto.filter(s => s.payload.customer === party);

  const tradableInstruments =
    inst.generics.map(createInstrumentKey)
      .concat(
        inst.fixedRateBonds.map(createInstrumentKey)
      )
      .concat(
        inst.floatingRateBonds.map(createInstrumentKey)
      )
      .concat(
        inst.inflationLinkedBonds.map(createInstrumentKey)
      )
      .concat(
        inst.zeroCouponBonds.map(createInstrumentKey)
      )

  const tradedInstrument = tradableInstruments.find(k => k.id.label === tradedInstrumentLabel);
  const quotedInstrument = inst.tokens.find(c => c.payload.id.label === quotedInstrumentLabel);

  const canRequest = !!tradedInstrumentLabel && !!tradedInstrument && !!quotedInstrumentLabel && !!quotedInstrument && !!id;

  if (inst.loading || svc.loading) return (<Spinner />);
  if (myListingServices.length === 0) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No listing service found for customer: {party}</h1></div>);

  const requestListing = async () => {
    if (!tradedInstrument || !quotedInstrument) return;
    const arg = {
      id,
      tradedInstrument: tradedInstrument,
      quotedInstrument: createInstrumentKey(quotedInstrument),
      observers : createSet([ getParty("Public") ])
    };
    if (myAutoListingServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndCreateListing, myAutoListingServices[0].contractId, arg);
      navigate("/listing/listings");
    } else {
      await ledger.exercise(Service.RequestCreateListing, myListingServices[0].contractId, arg);
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
                        {inst.tokens.filter(c => c.payload.id.label !== tradedInstrumentLabel).map((c, i) => (<MenuItem key={i} value={c.payload.id.label}>{c.payload.id.label}</MenuItem>))}
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
