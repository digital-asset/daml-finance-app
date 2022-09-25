// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { useLedger, useParty } from "@daml/react";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, MenuProps, Paper, Select, TextField, Typography } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Message } from "../../components/Message/Message";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { createSet } from "../../util";
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
  const { loading: l1, listing, listingAuto } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();

  const myListingServices = listing.filter(s => s.payload.customer === party);
  const myAutoListingServices = listingAuto.filter(s => s.payload.customer === party);
  const tradableInstruments = latests;
  const tradedInstrument = tradableInstruments.find(c => c.payload.id.unpack === tradedInstrumentLabel);
  const quotedInstrument = tokens.find(c => c.payload.id.unpack === quotedInstrumentLabel);
  const canRequest = !!tradedInstrumentLabel && !!tradedInstrument && !!quotedInstrumentLabel && !!quotedInstrument && !!id;

  if (l1 || l2) return <Spinner />;
  if (myListingServices.length === 0) return <Message text={"No listing service found for customer: " + party} />;

  const requestListing = async () => {
    if (!tradedInstrument || !quotedInstrument) return;
    const arg = {
      id,
      tradedInstrument: tradedInstrument.key,
      quotedInstrument: quotedInstrument.key,
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
                      <Select variant="standard" fullWidth value={tradedInstrumentLabel} onChange={e => setTradedAssetLabel(e.target.value as string)} MenuProps={menuProps}>
                        {tradableInstruments.filter(c => c.payload.id.unpack !== quotedInstrumentLabel).map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Quoted Asset</InputLabel>
                      <Select variant="standard" fullWidth value={quotedInstrumentLabel} onChange={e => setQuotedAssetLabel(e.target.value as string)} MenuProps={menuProps}>
                        {tokens.filter(c => c.payload.id.unpack !== tradedInstrumentLabel).map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
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
