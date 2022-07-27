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
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Service as B2BService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { values } from "../../util";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Account";

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

  const { contracts: directServices, loading: l1 } = useStreamQueries(Service);
  const { contracts: b2bServices, loading: l2 } = useStreamQueries(B2BService);
  const { contracts: derivatives, loading: l3 } = useStreamQueries(Derivative);
  const { contracts: accounts, loading: l4 } = useStreamQueries(AccountReference);

  const instruments = derivatives.filter(c => values(c.payload.issuer).includes(party));
  const instrument = instruments.find(c => c.payload.id.label === assetLabel);
  const hasB2B = b2bServices.length > 0;

  useEffect(() => {
    if (!!instrument) setNode(claimToNode(instrument.payload.claims));
  }, [instrument]);

  if (l1 || l2 || l3 || l4) return (<Spinner />);

  const myDirectServices = directServices.filter(s => s.payload.customer === party);
  const myB2BServices = b2bServices.filter(s => s.payload.customer === party);

  const canRequest = !!assetLabel && !!instrument && !!quantity;

  const requestIssuance = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian.map.has(party) && c.payload.accountView.owner.map.has(party));
      const providerAccount = accounts.find(c => c.payload.accountView.custodian.map.has(myB2BServices[0].payload.provider) && c.payload.accountView.owner.map.has(myB2BServices[0].payload.provider));
      if (!instrument || !customerAccount || !providerAccount) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: { depository: instrument.payload.depository, issuer: instrument.payload.issuer, id: instrument.payload.id } },
        customerAccount: customerAccount.key,
        providerAccount: providerAccount.key
      };
      await ledger.exercise(B2BService.CreateIssuance, myB2BServices[0].contractId, arg);
    } else {
      const account = accounts.find(c => c.payload.accountView.custodian.map.has(myDirectServices[0].payload.provider) && c.payload.accountView.owner.map.has(party));
      if (!instrument || !account) return;
      const arg = {
        id: uuidv4(),
        quantity: { amount: quantity, unit: { depository: instrument.payload.depository, issuer: instrument.payload.issuer, id: instrument.payload.id } },
        account: account.key,
      };
      await ledger.exercise(Service.RequestCreateIssuance, myDirectServices[0].contractId, arg);
    }
    navigate("/issuance/issuances");
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
                        {instruments.map((c, i) => (<MenuItem key={i} value={c.payload.id.label}>{c.payload.id.label}</MenuItem>))}
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
