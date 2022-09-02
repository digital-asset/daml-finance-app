// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, Box, IconButton, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { claimToNode } from "../../components/Claims/util";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { useServices } from "../../context/ServicesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { CreateEvent } from "@daml/ledger";
import { Service as BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Service as IssuanceAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service";
import { Service as Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Message } from "../../components/Message/Message";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ showAsset, setShowAsset ] = useState(false);
  const [ assetLabel, setAssetLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ quantity, setQuantity ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const ledger = useLedger();
  const party = useParty();
  const svc = useServices();
  const inst = useInstruments();
  const { contracts: accounts, loading: l1 } = useStreamQueries(AccountReference);

  const instruments : CreateEvent<any>[] = Array.prototype.concat.apply([],[
    inst.tokens,
    inst.generics,
    inst.fixedRateBonds,
    inst.floatingRateBonds,
    inst.inflationLinkedBonds,
    inst.zeroCouponBonds,
  ]);

  const myInstruments = instruments.filter(c => c.payload.issuer === party);
  const instrument = myInstruments.find(c => c.payload.id.unpack === assetLabel);

  useEffect(() => {
    if (!!instrument && !!instrument.payload.claims) setNode(claimToNode(instrument.payload.claims));
  }, [instrument]);

  if (svc.loading || inst.loading || l1) return (<Spinner />);
  if (!svc.issuance) return (<Message text="No issuance service found" />);

  const myB2BServices = svc.backToBack.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!assetLabel && !!instrument && !!quantity;

  const requestIssuance = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
      const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
      if (!instrument || !customerAccount || !providerAccount) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: { depository: instrument.payload.depository, issuer: instrument.payload.issuer, id: instrument.payload.id, version: instrument.payload.version } },
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
      if (!instrument || !account) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: { depository: instrument.payload.depository, issuer: instrument.payload.issuer, id: instrument.payload.id, version: instrument.payload.version } },
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
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Asset</InputLabel>
                      <Select className={classes.width90} value={assetLabel} onChange={e => setAssetLabel(e.target.value as string)} MenuProps={menuProps}>
                        {instruments.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                      <IconButton className={classes.marginLeft10} color="primary" size="small" component="span" onClick={() => setShowAsset(!showAsset)}>
                        {showAsset ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </Box>
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
            <Grid container direction="column" spacing={2}>
              {showAsset && (
                <Grid item xs={12}>
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Instrument</Typography>
                    <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]}/>
                  </Paper>
                </Grid>)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
