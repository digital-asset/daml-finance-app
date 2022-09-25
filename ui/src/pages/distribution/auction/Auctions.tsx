// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { getAuctionStatus } from "../Utils";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";

export const Auctions : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const { getName } = useParties();
  const { loading: l1, contracts: auctions } = useStreamQueries(Auction);
  if (l1) return <Spinner />;

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Auctions</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Agent</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Asset</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Floor</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Status</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auctions.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{fmt(c.payload.quantity.amount)} {c.payload.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{fmt(c.payload.floor, 4)} {c.payload.currency.id.unpack}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{getAuctionStatus(c.payload.status)}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate((party === c.payload.provider || party === c.payload.customer ? "/distribution/auctions/" : "/distribution/auction/") + c.contractId)}>                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
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
