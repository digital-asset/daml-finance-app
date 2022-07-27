// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, IconButton, Box } from "@mui/material";
import useStyles from "../../styles";
import { claimToNode } from "../../../components/Claims/util";
import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Auto/Service";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { Reference } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Account";
import { createKeyBase, createKeyDerivative, getHolding, setEquals } from "../../../util";

export const New : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ showInstrument, setShowInstrument ] = useState(false);
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ currencyLabel, setCurrencyLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ floor, setFloor ] = useState("");
  const [ id, setId ] = useState("");

  const ledger = useLedger();
  const party = useParty();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: autoServices, loading: l2 } = useStreamQueries(AutoService);
  const { contracts: derivatives, loading: l3 } = useStreamQueries(Derivative);
  const { contracts: instruments, loading: l4 } = useStreamQueries(Instrument);
  const { contracts: holdings, loading: l5 } = useStreamQueries(Holding);
  const { contracts: accounts, loading: l6 } = useStreamQueries(Reference);

  const myServices = services.filter(s => s.payload.customer === party);
  const myAutoServices = autoServices.filter(s => s.payload.customer === party);
  const instrument = derivatives.find(c => c.payload.id.label === instrumentLabel);
  const currency = instruments.find(c => c.payload.id.label === currencyLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner.map.has(party));
  const myHoldingLabels = myHoldings.map(c => c.payload.instrument.id.label).filter((v, i, a) => a.indexOf(v) === i);
  const baseKeys = instruments.map(c => ({ depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id}));
  const canRequest = !!instrumentLabel && !!instrument && !!currencyLabel && !!currency && !!id && !!amount && !!floor;

  useEffect(() => {
    if (!!instrument) setNode(claimToNode(instrument.payload.claims));
  }, [instrument]);

  if (l1 || l2 || l3 || l4 || l5 || l6) return (<Spinner />);
  if (myServices.length === 0) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No auction service found for customer: {party}</h1></div>);

  const requestCreateAuction = async () => {
    if (!instrument || !currency) return;
    const instrumentKey = createKeyDerivative(instrument);
    const currencyKey = createKeyBase(currency);
    const collateralCid = await getHolding(ledger, myHoldings, parseFloat(amount), instrumentKey);
    const receivableAccount = accounts.find(c => setEquals(c.payload.accountView.custodian, currency.payload.depository) && c.payload.accountView.owner.map.has(party))?.key;
    if (!receivableAccount) return;
    const arg = {
      id,
      quantity: { amount, unit: instrumentKey },
      currency: currencyKey,
      floor: floor,
      collateralCid,
      receivableAccount
    };
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndCreateAuction, myAutoServices[0].contractId, arg);
      navigate("/distribution/auctions");
    } else {
      await ledger.exercise(Service.RequestCreateAuction, myServices[0].contractId, arg);
      navigate("/distribution/requests");
    }
  }

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Auction</Typography>
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
                      <InputLabel className={classes.selectLabel}>Auctioned Asset</InputLabel>
                      <Select className={classes.width90} value={instrumentLabel} onChange={e => setInstrumentLabel(e.target.value as string)} MenuProps={menuProps}>
                        {myHoldingLabels.filter(a => a !== currencyLabel).map((a, i) => (<MenuItem key={i} value={a}>{a}</MenuItem>))}
                      </Select>
                      <IconButton className={classes.marginLeft10} color="primary" size="small" component="span" onClick={() => setShowInstrument(!showInstrument)}>
                        {showInstrument ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </Box>
                  </FormControl>
                  <FormControl className={classes.inputField} fullWidth>
                    <Box className={classes.fullWidth}>
                      <InputLabel className={classes.selectLabel}>Quoted Asset</InputLabel>
                      <Select className={classes.width90} value={currencyLabel} onChange={e => setCurrencyLabel(e.target.value as string)} MenuProps={menuProps}>
                        {baseKeys.filter(k => k.id.label !== instrumentLabel).map((k, i) => (<MenuItem key={i} value={k.id.label}>{k.id.label}</MenuItem>))}
                      </Select>
                    </Box>
                  </FormControl>
                  <TextField className={classes.inputField} fullWidth label="Quantity" type="number" value={amount} onChange={e => setAmount(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Floor Price" type="number" value={floor} onChange={e => setFloor(e.target.value as string)} />
                  <TextField className={classes.inputField} fullWidth label="Auction Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestCreateAuction}>Request Auction</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              {showInstrument && (
                <Grid item xs={12}>
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Auctioned Asset</Typography>
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
