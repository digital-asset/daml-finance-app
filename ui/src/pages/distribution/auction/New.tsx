// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel, IconButton, Box } from "@mui/material";
import useStyles from "../../styles";
import { and, claimToNode } from "../../../components/Claims/util";
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { createKey, createSet, getHolding } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentsContext";
import { CreateEvent } from "@daml/ledger";
import { useServices } from "../../../context/ServicesContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";
import { Service as Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Service as AuctionAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Auto/Service";
import { Message } from "../../../components/Message/Message";

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
  const { getParty } = useParties();
  const inst = useInstruments();
  const svc = useServices();

  const { contracts: holdings, loading: l1 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l2 } = useStreamQueries(Reference);

  const instruments : CreateEvent<any>[] = Array.prototype.concat.apply([], [inst.generics, inst.fixedRateBonds, inst.floatingRateBonds, inst.inflationLinkedBonds, inst.zeroCouponBonds]);
  const myServices = svc.auction.filter(s => s.payload.customer === party);
  const myAutoServices = svc.auctionAuto.filter(s => s.payload.customer === party);
  const instrument = instruments.find(c => c.payload.id.unpack === instrumentLabel);
  const currency = inst.tokens.find(c => c.payload.id.unpack === currencyLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myHoldingLabels = myHoldings.map(c => c.payload.instrument.id.unpack).filter((v, i, a) => a.indexOf(v) === i);
  const tokenLabels = inst.tokens.map(c => c.payload.id.unpack);
  const canRequest = !!instrumentLabel && !!instrument && !!currencyLabel && !!currency && !!id && !!amount && !!floor;

  useEffect(() => {
    const setClaims = async () => {
      if (!!instrument && svc.structuring.length > 0) {
        const [res, ] = await ledger.exercise(Structuring.GetClaims, svc.structuring[0].contractId, { instrumentCid: instrument.contractId })
        const claims = and(res.map(r => r.claim));
        setNode(claimToNode(claims));
      }
    }
    setClaims();
  }, [instrument, ledger, svc]);

  if (svc.loading || inst.loading || l1 || l2) return (<Spinner />);
  if (myServices.length === 0) return <Message text={"No auction service found for customer: " + party} />;

  const requestCreateAuction = async () => {
    if (!instrument || !currency) return;
    const instrumentKey = createKey(instrument);
    const currencyKey = createKey(currency);
    const collateralCid = await getHolding(ledger, myHoldings, parseFloat(amount), instrumentKey);
    const receivableAccount = accounts.find(c => c.payload.accountView.custodian === currency.payload.depository && c.payload.accountView.owner === party)?.key;
    if (!receivableAccount) return;
    const arg = {
      id,
      quantity: { amount, unit: instrumentKey },
      currency: currencyKey,
      floor: floor,
      collateralCid,
      receivableAccount,
      observers: createSet([getParty("Public")])
    };
    if (myAutoServices.length > 0) {
      await ledger.exercise(AuctionAuto.RequestAndCreateAuction, myAutoServices[0].contractId, arg);
      navigate("/distribution/auctions");
    } else {
      await ledger.exercise(Auction.RequestCreateAuction, myServices[0].contractId, arg);
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
                        {tokenLabels.map(l => (<MenuItem key={l} value={l}>{l}</MenuItem>))}
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
