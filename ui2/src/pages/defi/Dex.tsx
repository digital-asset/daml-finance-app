// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { Dex as DexContract } from "@daml.js/daml-finance-app/lib/DeFi/FlashSwap/Dex";
import { useParams } from "react-router";
import { Spinner } from "../../components/Spinner/Spinner";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Button, Grid, Paper, Table, TableBody, TableCell, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Percentage } from "../../components/Slider/Percentage";
import useStyles from "../styles";
import { Bonding } from "../../components/Curve/Bonding";
import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
import { createSet, values } from "../../util";
import { CreateEvent } from "@daml/ledger";
import { ContractId } from "@daml/types";

export const Dex : React.FC = () => {
  const classes = useStyles();

  const party = useParty();
  const ledger = useLedger();

  const [ isBuy, setIsBuy ] = useState(true);
  const [ quantity, setQuantity ] = useState(0.0);
  const [ price, setPrice ] = useState(0.0);
  const [ percentage, setPercentage ] = useState(0.0);
  const [ total, setTotal ] = useState(0.0);

  const { dexId } = useParams<any>();
  const { contracts: dexs, loading: l1 } = useStreamQueries(DexContract);
  const { contracts: assets, loading: l2 } = useStreamQueries(Holding);
  const dex = dexs.find(c => c.payload.id === dexId);

  const token1 = assets.find(c => c.contractId === dex?.payload.pool1.tokenCid);
  const token2 = assets.find(c => c.contractId === dex?.payload.pool2.tokenCid);

  useEffect(() => {
    if (!dex || !token1 || !token2) return;
    setPrice(parseFloat(token2.payload.amount) / parseFloat(token1.payload.amount));
  }, [dex, token1, token2]);

  if (l1 || l2 || !dex || !token1 || !token2) return <Spinner />;

  const xAsset = dex.payload.pool1.issuableCid;
  const yAsset = dex.payload.pool2.issuableCid;
  const x = parseFloat(token1.payload.amount);
  const y = parseFloat(token2.payload.amount);
  const xNew = isBuy ? x - quantity : x + quantity;
  const yNew = x * y / xNew;
  const available = assets.filter(c => c.payload.owner.map.has(party) && values(c.payload.owner).length === 1 && values(c.payload.lockers).length === 0);
  const tradedAssets = available.filter(c => c.payload.instrument === dex.payload.pool1.issuableCid);
  const quotedAssets = available.filter(c => c.payload.instrument === dex.payload.pool2.issuableCid);
  const tradedAssetsTotal = tradedAssets.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);
  const quotedAssetsTotal = quotedAssets.reduce((acc, c) => acc + parseFloat(c.payload.amount), 0);

  const handleBuySellChange = (buy : boolean) => {
    // const f = buy ? 1 : -1;
    // const dy = isNaN(total) ? 0 : total;
    // const dx = x * y / (y + f * dy) - x;
    const f = buy ? -1 : 1;
    const dx = isNaN(quantity) ? 0 : quantity;
    const dy = x * y / (x + f * dx) - y;
    const p = dx === 0 || dy === 0 ? y / x : dy / dx / -f;
    const t = quantity * p;
    const perc = buy ? (quotedAssetsTotal === 0 ? 0 : 100 * t / quotedAssetsTotal) : (tradedAssetsTotal === 0 || p === 0 ? 0 : 100 * t / p / tradedAssetsTotal);
    setPrice(p);
    setTotal(t);
    setPercentage(perc);
    setIsBuy(buy);
  }

  const handleQuantityChange = (q : number) => {
    const f = isBuy ? -1 : 1;
    const dx = isNaN(q) ? 0 : q;
    const dy = x * y / (x + f * dx) - y;
    const p = dx === 0 || dy === 0 ? y / x : dy / dx / -f;
    const perc = isBuy ? (quotedAssetsTotal === 0 ? 0 : 100 * q * p / quotedAssetsTotal) : (tradedAssetsTotal === 0 ? 0 : 100 * q / tradedAssetsTotal);
    setPrice(p);
    setQuantity(q);
    setTotal(q * p);
    setPercentage(perc);
  }

  const handleTotalChange = (t : number) => {
    const f = isBuy ? 1 : -1;
    const dy = isNaN(t) ? 0 : t;
    const dx = x * y / (y + f * dy) - x;
    const p = dx === 0 || dy === 0 ? y / x : dy / dx / -f;
    const perc = isBuy ? (quotedAssetsTotal === 0 ? 0 : 100 * t / quotedAssetsTotal) : (tradedAssetsTotal === 0 || p === 0 ? 0 : 100 * t / p / tradedAssetsTotal);
    setPrice(p);
    setQuantity(t / p);
    setTotal(t);
    setPercentage(perc);
  }

  const handlePercentageChange = (perc : number) => {
    if (isBuy) console.log(perc / 100 * quotedAssetsTotal);
    else console.log(perc / 100 * tradedAssetsTotal);
    if (isBuy) handleTotalChange(perc / 100 * quotedAssetsTotal);
    else handleQuantityChange(perc / 100 * tradedAssetsTotal);
  }

  const getAsset = async (deposits : CreateEvent<Holding>[], quantity : number) : Promise<string | null> => {
    const deposit = deposits.find(c => parseFloat(c.payload.amount) >= quantity);
    if (!deposit) return null;
    if (parseFloat(deposit.payload.amount) > quantity) {
      const [ [ split,], ] = await ledger.exercise(Holding.Split, deposit.contractId, { quantities: [quantity.toString()] });
      return split;
    }
    return deposit.contractId;
  }

  const makeTrade = async () => {
    const depositCid = isBuy ? await getAsset(quotedAssets, price * quantity) : await getAsset(tradedAssets, quantity);
    if (!depositCid) return;
    await ledger.exercise(DexContract.Swap, dex.contractId, { actors: createSet([party]), xTokenCid: depositCid as any });
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{dex.payload.pool1.issuableCid} / {dex.payload.pool2.issuableCid}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Bonding Curve</Typography>
                  <Bonding xAsset={xAsset} yAsset={yAsset} x={x} y={y} xNew={xNew} yNew={yNew} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={isBuy} exclusive onChange={(_, v) => { if (v !== null) handleBuySellChange(v as boolean); }}>
                  <ToggleButton className={classes.fullWidth} color="primary" value={true}>Buy</ToggleButton>
                  <ToggleButton className={classes.fullWidth} value={false}>Sell</ToggleButton>
                </ToggleButtonGroup>
                <TextField className={classes.inputField} fullWidth label="Quantity" type="number" value={quantity} onChange={e => handleQuantityChange(parseFloat(e.target.value))}/>
                <TextField className={classes.inputField} fullWidth label="Price" type="number" value={price} disabled />
                <Percentage step={1} valueLabelFormat={v => v + "%"} value={percentage} valueLabelDisplay="auto" onChange={(_, v) => handlePercentageChange(v as number)} />
                <TextField className={classes.inputField} fullWidth label="Total" type="number" value={total} onChange={e => handleTotalChange(parseFloat(e.target.value))}/>
                <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!price || !quantity} onClick={makeTrade}>{isBuy ? "Buy" : "Sell"} {dex.payload.pool1.issuableCid}</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classnames(classes.fullWidth, classes.paper)}>
          <Typography variant="h5" className={classes.heading}>Trades</Typography>
          <Table size="small">
            <TableBody>
              <TableRow key={0} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Symbol</b></TableCell>
                <TableCell key={1} className={classes.tableCell}><b>Order ID</b></TableCell>
                <TableCell key={2} className={classes.tableCell}><b>Type</b></TableCell>
                <TableCell key={3} className={classes.tableCell}><b>Side</b></TableCell>
                <TableCell key={4} className={classes.tableCell}><b>Price</b></TableCell>
                <TableCell key={5} className={classes.tableCell}><b>Quantity</b></TableCell>
                <TableCell key={6} className={classes.tableCell}><b>Volume</b></TableCell>
                <TableCell key={7} className={classes.tableCell}><b>TimeInForce</b></TableCell>
                <TableCell key={8} className={classes.tableCell}><b>Filled</b></TableCell>
              </TableRow>
              {/* {dexs.map((c, i) => (
                <TableRow key={i+1} className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}>{c.payload.details.listingId}</TableCell>
                  <TableCell key={1} className={classes.tableCell}>{c.payload.details.id}</TableCell>
                  <TableCell key={2} className={classes.tableCell}>{c.payload.details.orderType.tag}</TableCell>
                  <TableCell key={3} className={classes.tableCell} style={{ color: getColor(c)}}>{c.payload.details.side}</TableCell>
                  <TableCell key={4} className={classes.tableCell}>{getPrice(c)}</TableCell>
                  <TableCell key={5} className={classes.tableCell}>{getQuantity(c)}</TableCell>
                  <TableCell key={6} className={classes.tableCell}>{getVolume(c)}</TableCell>
                  <TableCell key={7} className={classes.tableCell}>{c.payload.details.timeInForce.tag}</TableCell>
                  <TableCell key={8} className={classes.tableCell}>{(100.0 - 100.0 * parseFloat(c.payload.remainingQuantity) / getQuantity(c)).toFixed(2)}%</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  );
};
