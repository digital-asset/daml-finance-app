// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, Box } from "@mui/material";
import useStyles from "../../styles";
import { Service } from "@daml.js/daml-finance-app-interface-distribution/lib/Daml/Finance/App/Interface/Distribution/Subscription/Service";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { dedup, singleton } from "../../../util";
import { BackToBack } from "@daml.js/daml-finance-app-interface-distribution/lib/Daml/Finance/App/Interface/Distribution/Subscription/Types";
import { useServices } from "../../../context/ServicesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { Message } from "../../../components/Message/Message";
import { Aggregate } from "../../../components/Instrument/Aggregate";
import { useHoldings } from "../../../context/HoldingContext";
import { useParties } from "../../../context/PartiesContext";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ description, setDescription ] = useState("");
  const [ offeredInstLabel, setOfferedInstLabel ] = useState("");
  const [ priceInstLabel, setPriceInstLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ price, setPrice ] = useState("");

  const { getParty } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, subscription, backToBack } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();
  const { loading: l3, holdings, getFungible } = useHoldings();

  const { contracts: accounts, loading: l4 } = useStreamQueries(Reference);

  const myServices = subscription.services.filter(s => s.payload.customer === party);
  const myB2BServices = backToBack.services.filter(s => s.payload.customer === party);
  const hasB2B = backToBack.services.length > 0;

  const offeredInst = latests.find(c => c.payload.id.unpack === offeredInstLabel);
  const priceInst = tokens.find(c => c.payload.id.unpack === priceInstLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myHoldingLabels = dedup(myHoldings.map(c => c.payload.instrument.id.unpack));
  const canRequest = !!offeredInstLabel && !!offeredInst && !!priceInstLabel && !!priceInst && !!amount && !!price;

  if (l1 || l2 || l3 || l4) return <Spinner />;
  if (myServices.length === 0) return <Message text={"No subscription service found for customer: " + party} />;

  const createOffering = async () => {
    if (!offeredInst || !priceInst) return;
    // TODO: Implicit assumption that accounts are held at the depository below
    const customerAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === party)?.key;
    const holdingCid = await getFungible(party, amount, offeredInst.key);
    if (!customerAccount) return;
    const offeringId = { unpack: uuidv4() };
    const observers = singleton(getParty("Public"));
    if (hasB2B) {
      const notional = parseFloat(amount) * parseFloat(price);
      const b2b = myB2BServices[0].payload.provider;
      const b2bReceivableAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === b2b)?.key;
      const issuerReceivableAccount = accounts.find(c => c.payload.accountView.custodian === b2b && c.payload.accountView.owner === party)?.key;
      if (!b2bReceivableAccount || !issuerReceivableAccount) return;
      const b2bDeliverableCid = await getFungible(b2b, amount, offeredInst.key);
      const issuerDeliverableCid = await getFungible(party, notional, priceInst.key);
      const backToBack : BackToBack = {
        party: b2b,
        offeringId,
        issuerReceivableAccount,
        issuerDeliverableCid,
        b2bReceivableAccount,
        b2bDeliverableCid
      };
      const arg = {
        offeringId,
        description,
        asset: { amount: amount, unit: offeredInst.key },
        price: { amount: price, unit: priceInst.key },
        customerHoldingCid: holdingCid,
        customerAccount,
        backToBack,
        observers
      };
      await ledger.exercise(Service.CreateOffering, myServices[0].service.contractId, arg);
    } else {
      const arg = {
        offeringId,
        description,
        asset: { amount: amount, unit: offeredInst.key },
        price: { amount: price, unit: priceInst.key },
        customerHoldingCid: holdingCid,
        customerAccount,
        backToBack: null,
        observers
      };
      await ledger.exercise(Service.CreateOffering, myServices[0].service.contractId, arg);
    }
    navigate("/app/distribution/offerings");
  }

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Offering</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <TextField variant="standard" className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Offered Asset</InputLabel>
                    <Select fullWidth value={offeredInstLabel} onChange={e => setOfferedInstLabel(e.target.value as string)} MenuProps={menuProps}>
                      {myHoldingLabels.filter(a => a !== priceInstLabel).map((a, i) => (<MenuItem key={i} value={a}>{a}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Offered Quantity" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Price" type="number" value={price} onChange={e => setPrice(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <Box>
                      <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                      <Select fullWidth value={priceInstLabel} onChange={e => setPriceInstLabel(e.target.value as string)} MenuProps={menuProps}>
                        {tokens.filter(c => c.key.id.unpack !== offeredInstLabel).map((k, i) => (<MenuItem key={i} value={k.key.id.unpack}>{k.key.id.unpack}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createOffering}>Create Offering</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            {!!offeredInst && <Aggregate instrument={offeredInst} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
