// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Service as IssuanceAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service";
import { Service as Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ quantity, setQuantity ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, backToBack, issuance, issuanceAuto } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { contracts: accounts, loading: l3 } = useStreamQueries(AccountReference);

  const aggregates = latests.filter(c => c.payload.issuer === party);
  const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);

  if (l1 || l2 || l3) return <Spinner />;
  if (!issuance) return (<Message text="No issuance service found" />);

  const myB2BServices = backToBack.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!instrumentLabel && !!aggregate && !!quantity;

  const requestIssuance = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
      const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
      if (!aggregate || !customerAccount || !providerAccount) return;
      const arg = {
        id: { unpack : id },
        description,
        quantity: { amount: quantity, unit: aggregate.key },
        customerAccount: customerAccount.key,
        providerAccount: providerAccount.key
      };
      await ledger.exercise(BackToBack.CreateIssuance, myB2BServices[0].contractId, arg);
      navigate("/issuance/issuances");
    } else {
      const hasAuto = issuanceAuto.length > 0;
      const myAutoSvc = issuanceAuto.filter(s => s.payload.customer === party)[0];
      const mySvc = issuance.filter(s => s.payload.customer === party)[0];
      const custodian = hasAuto ? myAutoSvc.payload.provider : mySvc.payload.provider;
      const account = accounts.find(c => c.payload.accountView.custodian === custodian && c.payload.accountView.owner === party);
      if (!aggregate || !account) return;
      const arg = {
        id: { unpack : id },
        description,
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
                  <TextField variant="standard" className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <TextField variant="standard" className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <InputLabel className={classes.selectLabel}>Asset</InputLabel>
                    <Select fullWidth value={instrumentLabel} onChange={e => setInstrumentLabel(e.target.value as string)} MenuProps={menuProps}>
                      {aggregates.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
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
            {!!aggregate && <Aggregate instrument={aggregate} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
