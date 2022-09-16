// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { useServices } from "../../context/ServicesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { Service as BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Service as IssuanceAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service";
import { Service as Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ quantity, setQuantity ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const svc = useServices();
  const inst = useInstruments();
  const { contracts: accounts, loading: l1 } = useStreamQueries(AccountReference);

  const aggregates = inst.latests.filter(c => c.instrument.payload.issuer === party);
  const aggregate = aggregates.find(c => c.instrument.payload.id.unpack === instrumentLabel);

  if (svc.loading || inst.loading || l1) return (<Spinner />);
  if (!svc.issuance) return (<Message text="No issuance service found" />);

  const myB2BServices = svc.backToBack.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!instrumentLabel && !!aggregate && !!quantity;

  const requestIssuance = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
      const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
      if (!aggregate || !customerAccount || !providerAccount) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: aggregate.key },
        customerAccount: customerAccount.key,
        providerAccount: providerAccount.key
      };
      await ledger.exercise(BackToBack.CreateIssuance, myB2BServices[0].contractId, arg);
      navigate("/issuance/issuances");
    } else {
      const hasAuto = svc.issuanceAuto.length > 0;
      const myAutoSvc = svc.issuanceAuto.filter(s => s.payload.customer === party)[0];
      const mySvc = svc.issuance.filter(s => s.payload.customer === party)[0];
      const custodian = hasAuto ? myAutoSvc.payload.provider : mySvc.payload.provider;
      const account = accounts.find(c => c.payload.accountView.custodian === custodian && c.payload.accountView.owner === party);
      if (!aggregate || !account) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: aggregate.key },
        account: account.key,
      };
      if (hasAuto) await ledger.exercise(IssuanceAuto.RequestAndCreateIssuance, myAutoSvc.contractId, arg);
      else await ledger.exercise(Issuance.RequestCreateIssuance, mySvc.contractId, arg);
      navigate("/issuance/issuances");
    }
  }

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Issuance</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Asset</InputLabel>
                    <Select fullWidth value={instrumentLabel} onChange={e => setInstrumentLabel(e.target.value as string)} MenuProps={menuProps}>
                      {aggregates.map((c, i) => (<MenuItem key={i} value={c.instrument.payload.id.unpack}>{c.instrument.payload.id.unpack}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value as string)} />
                  {hasB2B &&
                    <FormGroup>
                      <FormControlLabel control={<Checkbox checked={isB2B} onChange={e => setIsB2B(e.target.checked)}/>} label="Issue back-to-back" />
                    </FormGroup>}
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestIssuance}>Request Issuance</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            {!!aggregate && <Aggregate aggregate={aggregate} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
