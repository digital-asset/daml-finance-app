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
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { CreateOffering, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Service";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { Reference as AccountReference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { createKey, getHolding } from "../../../util";
import { BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Model";
import { useServices } from "../../../context/ServicesContext";
import { useInstruments } from "../../../context/InstrumentsContext";
import { Message } from "../../../components/Message/Message";

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
  const svc = useServices();
  const inst = useInstruments();

  const { contracts: holdings, loading: l1 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l2 } = useStreamQueries(AccountReference);

  const myServices = svc.subscription.filter(s => s.payload.customer === party);
  const myB2BServices = svc.backToBack.filter(s => s.payload.customer === party);
  const hasB2B = svc.backToBack.length > 0;

  const soldInst = inst.generics.find(c => c.payload.id.unpack === offeredInstLabel);
  const priceInst = inst.tokens.find(c => c.payload.id.unpack === priceInstLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myHoldingLabels = myHoldings.map(c => c.payload.instrument.id.unpack).filter((v, i, a) => a.indexOf(v) === i);
  const baseKeys = inst.tokens.map(createKey);
  const canRequest = !!offeredInstLabel && !!soldInst && !!priceInstLabel && !!priceInst && !!amount && !!price;

  useEffect(() => {
    if (!!soldInst) setNode(claimToNode(soldInst.payload.claims));
  }, [soldInst]);

  if (l1 || l2 || svc.loading || inst.loading) return (<Spinner />);
  if (myServices.length === 0) return <Message text={"No subscription service found for customer: " + party} />;

  const createOffering = async () => {
    const holding = myHoldings
      .filter(c => c.payload.instrument.id.unpack === offeredInstLabel)
      .find(c => parseFloat(c.payload.amount) >= parseFloat(amount));
    if (!soldInst || !priceInst || !holding) return;
    const customerAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === party)?.key;
    const holdingCid = await getHolding(ledger, myHoldings, parseFloat(amount), createKey(soldInst));
    if (!customerAccount) return;
    if (hasB2B) {
      const notional = parseFloat(amount) * parseFloat(price);
      const b2b = myB2BServices[0].payload.provider;
      const b2bReceivableAccount = accounts.find(c => c.payload.accountView.custodian === priceInst.payload.depository && c.payload.accountView.owner === b2b)?.key;
      const b2bHoldings = holdings.filter(c => c.payload.account.owner === b2b);
      const issuerReceivableAccount = accounts.find(c => c.payload.accountView.custodian === b2b && c.payload.accountView.owner === party)?.key;
      if (!b2bReceivableAccount || !issuerReceivableAccount) return;
      const b2bDeliverableCid = await getHolding(ledger, b2bHoldings, parseFloat(amount), createKey(soldInst));
      const issuerDeliverableCid = await getHolding(ledger, myHoldings, notional, createKey(priceInst));
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
        asset: { amount: amount, unit: createKey(soldInst) },
        price: { amount: price, unit: createKey(priceInst) },
        customerHoldingCid: holdingCid,
        customerAccount,
        backToBack
      };
      await ledger.exercise(Service.CreateOffering, myServices[0].contractId, arg);
    } else {
      const arg : CreateOffering = {
        offeringId: uuidv4(),
        asset: { amount: amount, unit: createKey(soldInst) },
        price: { amount: price, unit: createKey(priceInst) },
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
                        {baseKeys.filter(k => k.id.unpack !== offeredInstLabel).map((k, i) => (<MenuItem key={i} value={k.id.unpack}>{k.id.unpack}</MenuItem>))}
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
