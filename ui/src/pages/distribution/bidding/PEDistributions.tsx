// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, IconButton } from "@mui/material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Bid } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model";
import { getBidAllocation } from "../Utils";
import { KeyboardArrowRight } from "@mui/icons-material";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";

export const PEDistributions: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();

  const { contracts: auctions, loading: l1 } = useStreamQueries(Auction);
  const { contracts: bids, loading: l2 } = useStreamQueries(Bid);
  if (l1 || l2) return <Spinner />;

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">PE Distributions</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Auction Id</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Agent</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Issuer</b></TableCell>
                  <TableCell key={3} className={classes.tableCell}><b>Asset</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Quantity</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Details</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auctions.map((c, i) =>
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{c.payload.id}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                    <TableCell key={3} className={classes.tableCell}>{c.payload.quantity.unit.id.unpack}</TableCell>
                    <TableCell key={4} className={classes.tableCell}>{fmt(c.payload.quantity.amount)}</TableCell>
                    <TableCell key={5} className={classes.tableCell}>
                      <IconButton color="primary" size="small" component="span" onClick={() => navigate("/app/distribution/auction/" + c.contractId)}>
                        <KeyboardArrowRight fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Bids</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Auction Id</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Agent</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Issuer</b></TableCell>
                  <TableCell key={3} className={classes.tableCell}><b>Bid</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Price</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Status</b></TableCell>
                  <TableCell key={6} className={classes.tableCell}><b>Allocation</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{c.payload.auctionId}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                    <TableCell key={3} className={classes.tableCell}>{fmt(c.payload.details.quantity.amount)} {c.payload.details.quantity.unit.id.unpack}</TableCell>
                    <TableCell key={4} className={classes.tableCell}>{fmt(c.payload.details.price.amount, 4)} {c.payload.details.price.unit.id.unpack}</TableCell>
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
  );
};
