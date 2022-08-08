// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, IconButton, Box } from "@mui/material";
import useStyles from "../../styles";
import { claimToNode } from "../../../components/Claims/util";
import { Fungible } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Fungible";
import { CreateOffering, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Service";
import { Service as B2BService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Account";
import { createKeyBase, createKeyDerivative, getHolding } from "../../../util";
import { BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Model";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ showOfferedAsset, setShowOfferedAsset ] = useState(true);

  const [ offeredInstLabel, setOfferedInstLabel ] = useState("");
  const [ priceInstLabel, setPriceInstLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ price, setPrice ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const ledger = useLedger();
  const party = useParty();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: b2bServices, loading: l2 } = useStreamQueries(B2BService);
  const { contracts: derivatives, loading: l3 } = useStreamQueries(Derivative);
  const { contracts: instruments, loading: l4 } = useStreamQueries(Instrument);
  const { contracts: holdings, loading: l5 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l6 } = useStreamQueries(AccountReference);

  const myServices = services.filter(s => s.payload.customer === party);
  const myB2BServices = b2bServices.filter(s => s.payload.customer === party);
  const hasB2B = b2bServices.length > 0;

  const soldInst = derivatives.find(c => c.payload.id.label === offeredInstLabel);
  const priceInst = instruments.find(c => c.payload.id.label === priceInstLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myHoldingLabels = myHoldings.map(c => c.payload.instrument.id.label).filter((v, i, a) => a.indexOf(v) === i);
  const baseKeys = instruments.map(c => ({ depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id}));
  const canRequest = !!offeredInstLabel && !!soldInst && !!priceInstLabel && !!priceInst && !!amount && !!price;

  useEffect(() => {
    if (!!soldInst) setNode(claimToNode(soldInst.payload.claims));
  }, [soldInst]);

  if (l1 || l2 || l3 || l4 || l5 || l6) return (<Spinner />);
  if (myServices.length === 0) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No subscription service found for customer: {party}</h1></div>);

  const createOffering = async () => {
    const holding = myHoldings
      .filter(c => c.payload.instrument.id.label === offeredInstLabel)
      .find(c => parseFloat(c.payload.amount) >= parseFloat(amount));
    if (!soldInst || !priceInst || !holding) return;
    const customerAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === party)?.key;
    const holdingCid = await getHolding(ledger, myHoldings, parseFloat(amount), createKeyDerivative(soldInst));
    if (!customerAccount) return;
    if (hasB2B) {
      const notional = parseFloat(amount) * parseFloat(price);
      const b2b = myB2BServices[0].payload.provider;
      const b2bReceivableAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === b2b)?.key;
      const b2bHoldings = holdings.filter(c => c.payload.account.owner === b2b);
      const issuerReceivableAccount = accounts.find(c => c.payload.accountView.custodian === b2b && c.payload.accountView.owner === party)?.key;
      if (!b2bReceivableAccount || !issuerReceivableAccount) return;
      const b2bDeliverableCid = await getHolding(ledger, b2bHoldings, parseFloat(amount), createKeyDerivative(soldInst));
      const issuerDeliverableCid = await getHolding(ledger, myHoldings, notional, createKeyBase(priceInst));
      const offeringId = uuidv4();
      const backToBack : BackToBack = {
        party: b2b,
        offeringId,
        issuerReceivableAccount,
        issuerDeliverableCid,
        b2bReceivableAccount,
        b2bDeliverableCid
      };
      const arg : CreateOffering = {
        offeringId,
        asset: { amount: amount, unit: { depository: soldInst.payload.depository, issuer: soldInst.payload.issuer, id: soldInst.payload.id} },
        price: { amount: price, unit: { depository: priceInst.payload.depository, issuer: priceInst.payload.issuer, id: priceInst.payload.id} },
        customerHoldingCid: holdingCid,
        customerAccount,
        backToBack
      };
      await ledger.exercise(Service.CreateOffering, myServices[0].contractId, arg);
    } else {
      const arg : CreateOffering = {
        offeringId: uuidv4(),
        asset: { amount: amount, unit: { depository: soldInst.payload.depository, issuer: soldInst.payload.issuer, id: soldInst.payload.id} },
        price: { amount: price, unit: { depository: priceInst.payload.depository, issuer: priceInst.payload.issuer, id: priceInst.payload.id} },
        customerHoldingCid: holdingCid,
        customerAccount,
        backToBack: null
      };
      await ledger.exercise(Service.CreateOffering, myServices[0].contractId, arg);
    }
    navigate("/distribution/offerings");
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
                  <FormControl className={classes.inputField} fullWidth>
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Offered Asset</InputLabel>
                      <Select className={classes.width90} value={offeredInstLabel} onChange={e => setOfferedInstLabel(e.target.value as string)} MenuProps={menuProps}>
                        {myHoldingLabels.filter(a => a !== priceInstLabel).map((a, i) => (<MenuItem key={i} value={a}>{a}</MenuItem>))}
                      </Select>
                      <IconButton className={classes.marginLeft10} color="primary" size="small" component="span" onClick={() => setShowOfferedAsset(!showOfferedAsset)}>
                        {showOfferedAsset ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </Box>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Offered Quantity" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Price" type="number" value={price} onChange={e => setPrice(e.target.value as string)} />
                  <FormControl className={classes.inputField} fullWidth>
                    <Box>
                      <InputLabel className={classes.selectLabel}>Currency</InputLabel>
                      <Select fullWidth value={priceInstLabel} onChange={e => setPriceInstLabel(e.target.value as string)} MenuProps={menuProps}>
                        {baseKeys.filter(k => k.id.label !== offeredInstLabel).map((k, i) => (<MenuItem key={i} value={k.id.label}>{k.id.label}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createOffering}>Create Offering</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              {showOfferedAsset && (
                <Grid item xs={12}>
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Offered Asset</Typography>
                    <ClaimsTreeBuilder node={node} setNode={setNode} assets={baseKeys}/>
                  </Paper>
                </Grid>)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
