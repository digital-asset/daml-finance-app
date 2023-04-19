// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Table, TableBody, TableCell, TableRow, Button, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../../styles";
import { Auction as AuctionContract, Status as AuctionStatus } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Bid } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model";
import { getBidAllocation } from "../Utils";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { Message } from "../../../components/Message/Message";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServiceContext";
import { Factory } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Factory";

export const PEDistribution: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();

  const { contractId } = useParams<any>();

  const party = useParty();
  const ledger = useLedger();
  const svc = useServices();

  const { contracts: auctions, loading: l1 } = useStreamQueries(AuctionContract);
  const { contracts: bids, loading: l2 } = useStreamQueries(Bid);
  const { contracts: factories, loading: l3 } = useStreamQueries(Factory);

  const services = svc.auction.filter(s => s.payload.customer === party || s.payload.provider === party);
  const auction = auctions.find(c => c.contractId === contractId);

  if (svc.loading || l1 || l2 || l3) return <Spinner />;
  if (!contractId) return <Message text="No contract id provided" />;
  if (!auction) return <Message text="Auction not found" />;
  if (services.length === 0) return <Message text="No auction service found" />;

  const service = services[0];
  const provider = service.payload.provider;
  const filteredBids = bids.filter(c => c.payload.auctionId === auction.payload.id);
  const filledPerc = 100.0 * filteredBids.reduce((a, b) => a + (parseFloat(b.payload.details.price.amount) >= parseFloat(auction.payload.floor) ? parseFloat(b.payload.details.quantity.amount) : 0), 0) / parseFloat(auction.payload.quantity.amount);
  const currentPrice = filteredBids.length === 0 ? 0.0 : filteredBids.reduce((a, b) => parseFloat(b.payload.details.price.amount) >= parseFloat(auction.payload.floor) && parseFloat(b.payload.details.price.amount) < a ? parseFloat(b.payload.details.price.amount) : a, Number.MAX_VALUE);
  const canClose = auction.payload.status.tag !== "Open" || filteredBids.length === 0 || party !== provider;

  const closeAuction = async () => {
    if (factories.length === 0) return new Error("No settlement factory found");
    const bidCids = filteredBids.map(c => c.contractId);
    const [result, ] = await ledger.exercise(Service.ProcessAuction, service.contractId, { auctionCid: auction.contractId, bidCids });
    navigate("/app/distribution/auctions/" + result);
  };

  const getFinalPrice = (auctionStatus: AuctionStatus): string => {
    switch (auctionStatus.tag) {
      case 'PartiallyAllocated':
        return fmt(auctionStatus.value.finalPrice, 4);
      case 'FullyAllocated':
        return fmt(auctionStatus.value.finalPrice, 4);
      default:
        return "";
    }
  };

  const getParticallyAllocatedUnits = (auction: AuctionContract): number | undefined => {
    switch (auction.status.tag) {
      case 'PartiallyAllocated':
        return parseFloat(auction.quantity.amount) - parseFloat(auction.status.value.remaining)
      default:
        return undefined
    }
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{auction.payload.id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Bids</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Bidder</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}><b>Quantity</b></TableCell>
                        <TableCell key={2} className={classes.tableCell}><b>Price</b></TableCell>
                        <TableCell key={3} className={classes.tableCell}><b>Percentage</b></TableCell>
                        <TableCell key={4} className={classes.tableCell}><b>Time</b></TableCell>
                        <TableCell key={6} className={classes.tableCell}><b>Status</b></TableCell>
                        <TableCell key={7} className={classes.tableCell}><b>Allocation</b></TableCell>
                      </TableRow>
                      {filteredBids.map((c, i) => (
                        <TableRow key={i + 1} className={classes.tableRow} hover={true}>
                          <TableCell key={0} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                          <TableCell key={1} className={classes.tableCell}>{fmt(c.payload.details.quantity.amount)}</TableCell>
                          <TableCell key={2} className={classes.tableCell}>{fmt(c.payload.details.price.amount, 4)}</TableCell>
                          <TableCell key={3} className={classes.tableCell}>{fmt(100.0 * parseFloat(c.payload.details.quantity.amount) / parseFloat(auction.payload.quantity.amount), 2)}%</TableCell>
                          <TableCell key={4} className={classes.tableCell}>{c.payload.details.time}</TableCell>
                          <TableCell key={5} className={classes.tableCell}>{c.payload.status.tag}</TableCell>
                          <TableCell key={6} className={classes.tableCell}>{getBidAllocation(c.payload)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Details</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Issuer</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{getName(auction.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Agent</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{getName(auction.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{auction.payload.id}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Asset</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{fmt(auction.payload.quantity.amount)} {auction.payload.quantity.unit.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Floor</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{auction.payload.floor} {auction.payload.currency.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={5} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Subscribed %</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{filledPerc.toFixed(2)}%</TableCell>
                      </TableRow>
                      <TableRow key={6} className={classes.tableRow}>
                        <TableCell key={0} className={classes.tableCell}><b>Status</b></TableCell>
                        <TableCell key={1} className={classes.tableCell}>{auction.payload.status.tag}</TableCell>
                      </TableRow>
                      {getFinalPrice(auction.payload.status)
                        ?
                        <TableRow key={7} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}><b>Final price</b></TableCell>
                          <TableCell key={1} className={classes.tableCell}>{getFinalPrice(auction.payload.status)} {auction.payload.currency.id.unpack}</TableCell>
                        </TableRow>
                        :
                        <TableRow key={8} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}><b>Current price</b></TableCell>
                          <TableCell key={1} className={classes.tableCell}>{currentPrice.toFixed(4)} {auction.payload.currency.id.unpack}</TableCell>
                        </TableRow>
                      }
                      {getParticallyAllocatedUnits(auction.payload) &&
                        <TableRow key={9} className={classes.tableRow}>
                          <TableCell key={0} className={classes.tableCell}><b>Allocated</b></TableCell>
                          <TableCell key={1} className={classes.tableCell}>{getParticallyAllocatedUnits(auction.payload)?.toFixed(4)} {auction.payload.quantity.unit.id.unpack}</TableCell>
                        </TableRow>
                      }
                    </TableBody>
                  </Table>
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={canClose} onClick={closeAuction}>Close Auction</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
