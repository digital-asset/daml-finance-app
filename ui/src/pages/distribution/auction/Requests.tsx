// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { CreateAuctionRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServiceContext";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, auction } = useServices();
  const { loading: l2, contracts: requests } = useStreamQueries(CreateAuctionRequest);
  if (l1 || l2) return <Spinner />;

  const providerServices = auction.filter(s => s.payload.provider === party);

  const createAuction = async (c : CreateEvent<CreateAuctionRequest>) => {
    const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    if (!service) throw new Error("No auction service found");
    await ledger.exercise(Service.CreateAuction, service.contractId, { createAuctionRequestCid: c.contractId });
    navigate("/app/distribution/auctions");
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Auction Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Agent</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Auction ID</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Auctioned Asset</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Quoted Asset</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Floor Price</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{fmt(c.payload.quantity.amount)} {c.payload.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.currency.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.floor} {c.payload.currency.id.unpack}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => createAuction(c)}>Create</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
