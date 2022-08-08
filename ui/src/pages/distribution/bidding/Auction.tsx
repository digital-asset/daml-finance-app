// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import useStyles from "../../styles";
import classnames from "classnames";
import { Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Bid } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { Fungible } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Fungible";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Auto/Service";
import { claimToNode } from "../../../components/Claims/util";
import { getBidAllocation, getBidStatus } from "../Utils";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Spinner } from "../../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { createKeyBase, fmt, getHolding, getName } from "../../../util";
import { Reference } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Account";
import { Message } from "../../../components/Message/Message";

export const BiddingAuction : React.FC = () => {
  const classes = useStyles();

  const { contractId } = useParams<any>();
  const [ amount, setAmount ] = useState<number>(0);
  const [ price, setPrice ] = useState<number>(0);
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  const party = useParty();
  const ledger = useLedger();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: autoServices, loading: l2 } = useStreamQueries(AutoService);
  const { contracts: auctions, loading: l3 } = useStreamQueries(Auction);
  const { contracts: holdings, loading: l4 } = useStreamQueries(Fungible);
  const { contracts: bids, loading: l5 } = useStreamQueries(Bid);
  const { contracts: derivatives, loading: l6 } = useStreamQueries(Derivative);
  const { contracts: instruments, loading: l7 } = useStreamQueries(Instrument);
  const { contracts: accounts, loading: l8 } = useStreamQueries(Reference);

  const auctionedInstrument = derivatives.find(c => c.payload.id.label === auction?.payload.quantity.unit.id.label);

  useEffect(() => {
    if (!!auctionedInstrument) setNode(claimToNode(auctionedInstrument.payload.claims));
  }, [auctionedInstrument]);

  if (l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8) return (<Spinner />);

  const myServices = services.filter(c => c.payload.customer === party);
  const myAutoServices = autoServices.filter(c => c.payload.customer === party);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const auction = auctions.find(b => b.contractId === contractId);
  const baseKeys = instruments.map(createKeyBase);

  if (services.length === 0) return <Message text="No bidding service found" />
  if (!auction) return <Message text="Auction not found" />
  if (!auctionedInstrument) return <Message text="Auctioned instrument not found" />

  const bid = bids.find(b => b.payload.auctionId === auction.payload.id);

  const requestCreateBid = async () => {
    const volume = price * amount;
    const receivableAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === auctionedInstrument.payload.depository)?.key;
    const collateralCid = await getHolding(ledger, myHoldings, volume, auction.payload.currency);
    if (!receivableAccount) return;
    const arg = {
      auctionCid: auction.contractId,
      price: price.toString(),
      amount: amount.toString(),
      collateralCid,
      receivableAccount
    };
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndCreateBid, myAutoServices[0].contractId, arg);
    } else {
      await ledger.exercise(Service.RequestCreateBid, myServices[0].contractId, arg);
    }

  };

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{auction.payload.id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column">
              <Grid xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Auction Details</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Issuer</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getName(auction.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Agent</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getName(auction.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Auction Id</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{auction.payload.id}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Instrument</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{auction.payload.quantity.unit.id.label}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Amount</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(auction.payload.quantity.amount)}</TableCell>
                      </TableRow>
                      <TableRow key={5} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Currency</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{auction.payload.currency.id.label}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              <Grid xs={12}>
                {!!bid &&
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Bid</Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow key={0} className={classes.tableRow}>
                          <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Amount</b></TableCell>
                          <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(bid.payload.details.quantity.amount)}</TableCell>
                        </TableRow>
                        <TableRow key={1} className={classes.tableRow}>
                          <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Price</b></TableCell>
                          <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(bid.payload.details.price.amount, 4)} {auction.payload.currency.id.label}</TableCell>
                        </TableRow>
                        <TableRow key={1} className={classes.tableRow}>
                          <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Status</b></TableCell>
                          <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getBidStatus(bid.payload.status)}</TableCell>
                        </TableRow>
                        {getBidAllocation(bid.payload) &&
                          <TableRow key={1} className={classes.tableRow}>
                            <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Allocation</b></TableCell>
                            <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getBidAllocation(bid.payload)}</TableCell>
                          </TableRow>
                        }
                      </TableBody>
                    </Table>
                  </Paper>}
                {!bid &&
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Submit Bid</Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow key={0} className={classes.tableRow}>
                          <TextField required autoFocus fullWidth type="number" label={"Quantity (" + auction.payload.quantity.unit.id.label + ")"} onChange={e => setAmount(parseFloat(e.target.value))} />
                        </TableRow>
                        <TableRow key={1} className={classes.tableRow}>
                          <TextField required fullWidth className={classes.inputField} type="number" label={"Price (" + auction.payload.currency.id.label + ")"} onChange={e => setPrice(parseFloat(e.target.value))} />
                        </TableRow>
                        <TableRow key={2} className={classes.tableRow}>
                          <Button color="primary" className={classnames(classes.fullWidth, classes.buttonMargin)} variant="contained" disabled={price === 0 || amount === 0} onClick={() => requestCreateBid()}>Bid</Button>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Auctioned Instrument</Typography>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={baseKeys}/>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
