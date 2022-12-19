// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useLedger, useParty } from "@daml/react";
import { v4 as uuidv4 } from "uuid";
import { Button, Grid, Paper, Typography } from "@mui/material";
import classnames from "classnames";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { Spinner } from "../../components/Spinner/Spinner";
import { useInstruments } from "../../context/InstrumentContext";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { createSet } from "../../util";
import useStyles from "../styles";
import { Service as Auto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Auto";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Service";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ instrument, setInstrument ] = useState("");
  const [ currency, setCurrency ] = useState("");
  const [ description, setDescription ] = useState("");

  const { getParty } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, listing } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();

  const tradableInstruments = latests;
  const tradedInstrument = tradableInstruments.find(c => c.payload.id.unpack === instrument);
  const quotedInstrument = tokens.find(c => c.payload.id.unpack === currency);
  const canRequest = !!instrument && !!tradedInstrument && !!currency && !!quotedInstrument && !!description;

  if (l1 || l2) return <Spinner />;

  const requestListing = async () => {
    const exchange = getParty("Exchange"); // TODO: Hard-coded exchange party
    const svc = listing.getService(exchange, party);
    if (!svc) throw new Error("No listing service found for provider [" + exchange + "] and customer [" + party + "]");
    if (!tradedInstrument || !quotedInstrument) throw new Error("Traded or quoted instrument not found");
    const arg = {
      listingId : { unpack: uuidv4() },
      description,
      tradedInstrument: tradedInstrument.key,
      quotedInstrument: quotedInstrument.key,
      observers : createSet([ getParty("Public") ]) // TODO: Hard-coded public party
    };
    if (!!svc.auto) await ledger.exercise(Auto.RequestAndList, svc.auto.contractId, arg);
    else await ledger.exercise(Service.RequestListing, svc.service.contractId, arg);
    navigate("/app/listing/listings");
  };

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
              <TextInput    label="Description" value={description} setValue={setDescription} />
              <SelectInput  label="Instrument"  value={instrument}  setValue={setInstrument}  values={toValues(tradableInstruments)} />
              <SelectInput  label="Currency"    value={currency}    setValue={setCurrency}    values={toValues(tokens)} />
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestListing}>{"List"}</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
