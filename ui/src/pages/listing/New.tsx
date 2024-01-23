// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { useLedger, useParty } from "@daml/react";
import { Button, Grid, Paper, Typography } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { Message } from "../../components/Message/Message";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { createSet } from "../../util";
import useStyles from "../styles";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ instrument, setInstrument ] = useState("");
  const [ currency, setCurrency ] = useState("");
  const [ id, setId ] = useState("");

  const { getParty } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, listing, listingAuto } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();

  const myListingServices = listing.filter(s => s.payload.customer === party);
  const myAutoListingServices = listingAuto.filter(s => s.payload.customer === party);
  const tradableInstruments = latests;
  const tradedInstrument = tradableInstruments.find(c => c.payload.id.unpack === instrument);
  const quotedInstrument = tokens.find(c => c.payload.id.unpack === currency);
  const canRequest = !!instrument && !!tradedInstrument && !!currency && !!quotedInstrument && !!id;

  if (l1 || l2) return <Spinner />;
  if (myListingServices.length === 0) return <Message text={"No listing service found for customer: " + party} />;
  const hasAuto = myAutoListingServices.length > 0;
  const requestListing = async () => {
    if (!tradedInstrument || !quotedInstrument) return;
    const arg = {
      id,
      tradedInstrument: tradedInstrument.key,
      quotedInstrument: quotedInstrument.key,
      observers : createSet([ getParty("Public") ])
    };
    if (hasAuto) {
      await ledger.exercise(AutoService.RequestAndCreateListing, myAutoListingServices[0].contractId, arg);
      navigate("/app/listing/listings");
    } else {
      await ledger.exercise(Service.RequestCreateListing, myListingServices[0].contractId, arg);
      navigate("/app/listing/requests");
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>New Listing</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              <TextInput    label="Id"          value={id}              setValue={setId} />
              <SelectInput  label="Instrument"  value={instrument}  setValue={setInstrument}  values={toValues(tradableInstruments)} />
              <SelectInput  label="Currency"    value={currency}    setValue={setCurrency}    values={toValues(tokens)} />
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestListing}>{hasAuto ? "List" : "Request Listing"}</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
