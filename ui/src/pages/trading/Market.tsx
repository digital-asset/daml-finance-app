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
import { createSet, fmt, keyEquals } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { Percentage } from "../../components/Slider/Percentage";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { Message } from "../../components/Message/Message";
import { useHoldings } from "../../context/HoldingsContext";

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

  const { loading: l1, trading, tradingAuto } = useServices();
  const { loading: l2, holdings, getFungible } = useHoldings();

  const { contracts: listings, loading: l3 } = useStreamQueries(ListingContract);
  const { contracts: accounts, loading: l4 } = useStreamQueries(Reference);
  const { contracts: orders, loading: l5 } = useStreamQueries(Order);
  const { contractId } = useParams<any>();

  if (l1 || l2 || l3 || l4 || l5) return (<Spinner />);

  const myServices = trading.filter(s => s.payload.customer === party);
  const myAutoServices = tradingAuto.filter(s => s.payload.customer === party);
  const listing = listings.find(c => c.contractId === contractId!);

  if (myServices.length === 0) return <Message text="No trading service found" />;
  if (!listing) return <Message text="Listing not found" />;

  const limits = orders.filter(c => c.payload.listingId === listing.payload.id && parseFloat(c.payload.quantity.amount) !== 0);
  const bids = limits.filter(c => c.payload.side === Side.Buy).sort((a, b) => parseFloat(b.payload.price.amount) - parseFloat(a.payload.price.amount));
  const asks = limits.filter(c => c.payload.side === Side.Sell).sort((a, b) => parseFloat(b.payload.price.amount) - parseFloat(a.payload.price.amount));

  const available = holdings.filter(c => !c.lockable || !c.lockable.payload.lock);
  const tradedHoldings = available.filter(c => keyEquals(c.payload.instrument, listing.payload.tradedInstrument));
  const quotedHoldings = available.filter(c => keyEquals(c.payload.instrument, listing.payload.quotedInstrument));
  const tradedHoldingsTotal = tradedHoldings.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);
  const quotedHoldingsTotal = quotedHoldings.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);
  const availableQuantity = isBuy ? fmt(quotedHoldingsTotal) + " " + listing.payload.quotedInstrument.id.unpack : fmt(tradedHoldingsTotal) + " " + listing.payload.tradedInstrument.id.unpack;

  const requestCreateOrder = async () => {
    const collateralCid = isBuy ? await getFungible(party, price * amount, listing.payload.quotedInstrument) : await getFungible(party, amount, listing.payload.tradedInstrument);
    const account = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === (isBuy ? listing.payload.tradedInstrument : listing.payload.quotedInstrument).depository);
    const orderCids = isBuy ? asks.map(c => c.contractId) : bids.map(c => c.contractId);
    if (!collateralCid || !account) return;
    console.log(account);
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
                        <TableCell key={4} className={classes.tableCell}><b>Sell Volume ({listing.payload.quotedInstrument.id.unpack})</b></TableCell>
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
                        <TableCell key={0} className={classes.tableCell}><b>Buy Volume ({listing.payload.quotedInstrument.id.unpack})</b></TableCell>
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
                <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!price || !amount} onClick={requestCreateOrder}>{isBuy ? "Buy" : "Sell"} {listing.payload.tradedInstrument.id.unpack}</Button>
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
