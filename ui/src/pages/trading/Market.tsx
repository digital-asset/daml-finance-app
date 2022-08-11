// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import classnames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, TextField, Button, Paper, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Listing as ListingContract } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { Order, Side } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Auto/Service";
import { CreateEvent } from "@daml/ledger";
import { ContractId } from "@daml/types";
import { createSet, fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { Percentage } from "../../components/Slider/Percentage";
import { Fungible } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Fungible";
import { Reference } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Account";
import { useParties } from "../../context/PartiesContext";

export const Market : React.FC = () => {
  const classes = useStyles();

  const [ isBuy, setIsBuy ] = useState(true);
  const [ isLimit, setIsLimit ] = useState(true);
  const [ price, setPrice ] = useState(0.0);
  const [ amount, setQuantity ] = useState(0.0);
  const [ percentage, setPercentage ] = useState(0.0);
  const [ total, setTotal ] = useState(0.0);

  const handlePriceChange = (p : number) => {
    const perc = isBuy ? (quotedHoldingsTotal === 0 ? 0 : 100 * amount * p / quotedHoldingsTotal) : (tradedHoldingsTotal === 0 ? 0 : 100 * amount / tradedHoldingsTotal);
    setPrice(p);
    setTotal(amount * p);
    setPercentage(perc);
  }

  const handleQuantityChange = (q : number) => {
    const perc = isBuy ? (quotedHoldingsTotal === 0 ? 0 : 100 * q * price / quotedHoldingsTotal) : (tradedHoldingsTotal === 0 ? 0 : 100 * q / tradedHoldingsTotal);
    setQuantity(q);
    setTotal(q * price);
    setPercentage(perc);
  }

  const handleTotalChange = (t : number) => {
    const perc = isBuy ? (quotedHoldingsTotal === 0 ? 0 : 100 * t / quotedHoldingsTotal) : (tradedHoldingsTotal === 0 || price === 0 ? 0 : 100 * t / price / tradedHoldingsTotal);
    setQuantity(t / price);
    setTotal(t);
    setPercentage(perc);
  }

  const handlePercentageChange = (perc : number) => {
    const q = isBuy ? (price === 0 ? 0 : perc * quotedHoldingsTotal / 100 / price) : perc * tradedHoldingsTotal / 100;
    setQuantity(q);
    setTotal(q * price);
    setPercentage(perc);
  }

  const { getParty } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: autoServices, loading: l2 } = useStreamQueries(AutoService);
  const { contracts: listings, loading: l3 } = useStreamQueries(ListingContract);
  const { contracts: holdings, loading: l4 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l5 } = useStreamQueries(Reference);
  const { contracts: orders, loading: l6 } = useStreamQueries(Order);
  const { contractId } = useParams<any>();

  if (l1 || l2 || l3 || l4 || l5 || l6) return (<Spinner />);

  if (!contractId) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No contract id provided</h1></div>);
  const cid = contractId.replace("_", "#");

  const myServices = services.filter(s => s.payload.customer === party);
  const myAutoServices = autoServices.filter(s => s.payload.customer === party);
  const listing = listings.find(c => c.contractId === cid);

  if (myServices.length === 0) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>No trading service found</h1></div>);
  if (!listing) return (<div style={{display: 'flex', justifyContent: 'center', marginTop: 350 }}><h1>Listing not found</h1></div>);

  const limits = orders.filter(c => c.payload.listingId === listing.payload.id && parseFloat(c.payload.quantity.amount) !== 0);
  const bids = limits.filter(c => c.payload.side === Side.Buy).sort((a, b) => parseFloat(b.payload.price.amount) - parseFloat(a.payload.price.amount));
  const asks = limits.filter(c => c.payload.side === Side.Sell).sort((a, b) => parseFloat(b.payload.price.amount) - parseFloat(a.payload.price.amount));

  const available = holdings.filter(c => !c.payload.lock);
  const tradedHoldings = available.filter(c => c.payload.instrument.id.label === listing.payload.tradedInstrument.id.label); // TODO: Doesn't support instrument versions
  const quotedHoldings = available.filter(c => c.payload.instrument.id.label === listing.payload.quotedInstrument.id.label); // TODO: Doesn't support instrument versions
  const tradedHoldingsTotal = tradedHoldings.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);
  const quotedHoldingsTotal = quotedHoldings.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);
  const availableQuantity = isBuy ? fmt(quotedHoldingsTotal) + " " + listing.payload.quotedInstrument.id.label : fmt(tradedHoldingsTotal) + " " + listing.payload.tradedInstrument.id.label;

  const getAsset = async (holdings : CreateEvent<Fungible>[], amount : number) : Promise<ContractId<Fungible> | null> => {
    const holding = holdings.find(c => parseFloat(c.payload.amount) >= amount);
    if (!holding) return null;
    if (parseFloat(holding.payload.amount) > amount) {
      const [splitResult, ] = await ledger.exercise(Fungible.Split, holding.contractId, { amounts: [amount.toString()] });
      return splitResult.splitCids[0];
    }
    return holding.contractId;
  }

  const requestCreateOrder = async () => {
    const collateralCid = isBuy ? await getAsset(quotedHoldings, price * amount) : await getAsset(tradedHoldings, amount);
    const account = accounts.find(c => c.payload.accountView.custodian === listing.payload.tradedInstrument.depository);
    const orderCids = isBuy ? asks.map(c => c.contractId) : bids.map(c => c.contractId);
    if (!collateralCid || !account) return;
    const arg = {
      id: uuidv4(),
      listingId: listing.payload.id,
      quantity: { unit : listing.payload.tradedInstrument, amount: amount.toString() },
      price: { unit : listing.payload.quotedInstrument, amount: price.toString() },
      side : isBuy ? Side.Buy : Side.Sell,
      collateralCid,
      account : account.key,
      orderCids,
      observers: createSet([ getParty("Public") ])
    }
    console.log(arg);
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndCreateOrder, myAutoServices[0].contractId, arg);
    } else {
      await ledger.exercise(Service.RequestCreateOrder, myServices[0].contractId, arg);
    }
  };

  const getPrice = (c : CreateEvent<Order>) => {
    return parseFloat(c.payload.price.amount);
  }

  const getQuantity = (c : CreateEvent<Order>) => {
    return parseFloat(c.payload.quantity.amount);
  }

  const getVolume = (c : CreateEvent<Order>) => {
    return getPrice(c) * getQuantity(c);
  }

  const getColor = (c : CreateEvent<Order>) => {
    return c.payload.side === Side.Buy ? "green" : "red";
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{listing.payload.id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Orderbook</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}></TableCell>
                        <TableCell key={1} className={classes.tableCell}></TableCell>
                        <TableCell key={2} className={classes.tableCell}><b>Price</b></TableCell>
                        <TableCell key={3} className={classes.tableCell}><b>Sell Quantity</b></TableCell>
                        <TableCell key={4} className={classes.tableCell}><b>Sell Volume ({listing.payload.quotedInstrument.id.label})</b></TableCell>
                      </TableRow>
                      {asks.map((c, i) => (
                        <TableRow key={i+2} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}></TableCell>
                          <TableCell key={1} className={classes.tableCell}></TableCell>
                          <TableCell key={2} className={classes.tableCell} style={{ color: "red"}}>{getPrice(c)}</TableCell>
                          <TableCell key={3} className={classes.tableCell}>{getQuantity(c)}</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{getVolume(c)}</TableCell>
                        </TableRow>
                      ))}
                      {bids.map((c, i) => (
                        <TableRow key={asks.length+2} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}>{getVolume(c)}</TableCell>
                          <TableCell key={1} className={classes.tableCell}>{getQuantity(c)}</TableCell>
                          <TableCell key={2} className={classes.tableCell} style={{ color: "green"}}>{getPrice(c)}</TableCell>
                          <TableCell key={3} className={classes.tableCell}></TableCell>
                          <TableCell key={4} className={classes.tableCell}></TableCell>
                        </TableRow>
                      ))}
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Buy Volume ({listing.payload.quotedInstrument.id.label})</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}><b>Buy Quantity</b></TableCell>
                        <TableCell key={2} className={classes.tableCell}><b>Price</b></TableCell>
                        <TableCell key={3} className={classes.tableCell}></TableCell>
                        <TableCell key={4} className={classes.tableCell}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={isBuy} exclusive onChange={(_, v) => { if (v !== null) setIsBuy(v); }}>
                  <ToggleButton className={classes.fullWidth} color="primary" value={true}>Buy</ToggleButton>
                  <ToggleButton className={classes.fullWidth} color="secondary" value={false}>Sell</ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup className={classnames(classes.fullWidth, classes.buttonMargin)} value={isLimit} exclusive disabled onChange={(_, v) => { if (v !== null) setIsLimit(v); }}>
                  <ToggleButton className={classes.fullWidth} value={true}>Limit</ToggleButton>
                  <ToggleButton className={classes.fullWidth} value={false}>Market</ToggleButton>
                </ToggleButtonGroup>
                <TextField className={classes.inputField} fullWidth label="Available" type="text" value={availableQuantity} disabled/>
                <TextField className={classes.inputField} fullWidth label="Price" type="number" value={isLimit ? price : "Market"} disabled={!isLimit} onChange={e => handlePriceChange(parseFloat(e.target.value))}/>
                <TextField className={classes.inputField} fullWidth label="Quantity" type="number" value={amount} onChange={e => handleQuantityChange(parseFloat(e.target.value))}/>
                <Percentage step={5} valueLabelFormat={v => v + "%"} value={percentage} valueLabelDisplay="auto" onChange={(_, v) => handlePercentageChange(v as number)} />
                <TextField className={classes.inputField} fullWidth label="Total" type="number" value={total} onChange={e => handleTotalChange(parseFloat(e.target.value))}/>
                <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!price || !amount} onClick={requestCreateOrder}>{isBuy ? "Buy" : "Sell"} {listing.payload.tradedInstrument.id.label}</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Typography variant="h5" className={classes.heading}>Orders</Typography>
                <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Symbol</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}><b>Order Id</b></TableCell>
                        <TableCell key={2} className={classes.tableCell}><b>Type</b></TableCell>
                        <TableCell key={3} className={classes.tableCell}><b>Side</b></TableCell>
                        <TableCell key={4} className={classes.tableCell}><b>Price</b></TableCell>
                        <TableCell key={5} className={classes.tableCell}><b>Quantity</b></TableCell>
                        <TableCell key={6} className={classes.tableCell}><b>Volume</b></TableCell>
                      </TableRow>
                      {limits.map((c, i) => (
                        <TableRow key={i+1} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}>{c.payload.listingId}</TableCell>
                          <TableCell key={1} className={classes.tableCell}>{c.payload.id}</TableCell>
                          <TableCell key={2} className={classes.tableCell}>Limit</TableCell>
                          <TableCell key={3} className={classes.tableCell} style={{ color: getColor(c)}}>{c.payload.side}</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{getPrice(c)}</TableCell>
                          <TableCell key={5} className={classes.tableCell}>{getQuantity(c)}</TableCell>
                          <TableCell key={6} className={classes.tableCell}>{getVolume(c)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Typography variant="h5" className={classes.heading}>Trades</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
