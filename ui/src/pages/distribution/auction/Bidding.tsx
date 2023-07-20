// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../../styles";
import classnames from "classnames";
import { Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Bid } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Auto/Service";
import { getBidAllocation } from "../Utils";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { Message } from "../../../components/Message/Message";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServiceContext";
import { Aggregate } from "../../../components/Instrument/Aggregate";
import { useHoldings } from "../../../context/HoldingContext";

export const Bidding : React.FC = () => {
  const classes = useStyles();

  const [ amount, setAmount ] = useState<number>(0);
  const [ price, setPrice ] = useState<number>(0);

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, bidding, biddingAuto } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, getFungible } = useHoldings();
  const { loading: l4, contracts: auctions } = useStreamQueries(Auction);
  const { loading: l5, contracts: bids } = useStreamQueries(Bid);
  const { loading: l6, contracts: accounts } = useStreamQueries(Reference);

  const { contractId } = useParams<any>();
  const auction = auctions.find(b => b.contractId === contractId);
  const instrument = latests.find(c => c.payload.id.unpack === auction?.payload.quantity.unit.id.unpack);

  if (l1 || l2 || l3 || l4 || l5 || l6) return <Spinner />;

  const myServices = bidding.filter(c => c.payload.customer === party);
  const myAutoServices = biddingAuto.filter(c => c.payload.customer === party);

  if (myServices.length === 0) return <Message text="No bidding service found" />
  if (!auction) return <Message text="Auction not found" />
  if (!instrument) return <Message text="Auctioned instrument not found" />

  const bid = bids.find(b => b.payload.auctionId === auction.payload.id);

  const requestCreateBid = async () => {
    console.log("We Got Here 1.")
    const volume = price * amount;
    // TODO: Implicit assumption that account is held with depository
    const receivableAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === instrument.payload.depository)?.key;
    const collateralCid = await getFungible(party, volume, auction.payload.currency);
    console.log("We Got Here 2.")
    if (!receivableAccount) {
      console.log("We Got Here 2.1.")
      return;
    }
    const arg = {
      auctionCid: auction.contractId,
      price: price.toString(),
      amount: amount.toString(),
      collateralCid,
      receivableAccount
    };
    if (myAutoServices.length > 0) {
      console.log("We Got Here 3.")
      await ledger.exercise(AutoService.RequestAndCreateBid, myAutoServices[0].contractId, arg);
    } else {
      console.log("We Got Here 4.")
      await ledger.exercise(Service.RequestCreateBid, myServices[0].contractId, arg);
    }
    console.log("But not Here.")
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
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{auction.payload.quantity.unit.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Amount</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(auction.payload.quantity.amount)}</TableCell>
                      </TableRow>
                      <TableRow key={5} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Currency</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{auction.payload.currency.id.unpack}</TableCell>
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
                          <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(bid.payload.details.price.amount, 4)} {auction.payload.currency.id.unpack}</TableCell>
                        </TableRow>
                        <TableRow key={1} className={classes.tableRow}>
                          <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Status</b></TableCell>
                          <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{bid.payload.status.tag}</TableCell>
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
                          <TableCell className={classes.tableCell}>
                            <TextField required autoFocus fullWidth type="number" label={"Quantity (" + auction.payload.quantity.unit.id.unpack + ")"} onChange={e => setAmount(parseFloat(e.target.value))} />
                          </TableCell>
                        </TableRow>
                        <TableRow key={1} className={classes.tableRow}>
                          <TableCell className={classes.tableCell}>
                            <TextField required fullWidth className={classes.inputField} type="number" label={"Price (" + auction.payload.currency.id.unpack + ")"} onChange={e => setPrice(parseFloat(e.target.value))} />
                          </TableCell>
                        </TableRow>
                        <TableRow key={2} className={classes.tableRow}>
                          <TableCell className={classes.tableCell}>
                            <Button color="primary" className={classnames(classes.fullWidth, classes.buttonMargin)} variant="contained" disabled={price === 0 || amount === 0} onClick={() => requestCreateBid()}>Bid</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            {!!instrument && <Aggregate instrument={instrument} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
