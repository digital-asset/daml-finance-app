// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../hooks/Parties";

export const Listings : React.FC = () => {
  const classes = useStyles();

  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();

  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: autoServices, loading: l2 } = useStreamQueries(AutoService);
  const { contracts: listings, loading: l3 } = useStreamQueries(Listing);
  if (l1 || l2 || l3) return (<Spinner />);

  const myServices = services.filter(s => s.payload.customer === party);
  const myAutoServices = autoServices.filter(s => s.payload.customer === party);

  const requestDeleteDelisting = async (c : CreateEvent<Listing>) => {
    if (myServices.length === 0) return; // TODO: Display error
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndDeleteListing, myAutoServices[0].contractId, { listingCid: c.contractId });
    } else {
      await ledger.exercise(Service.RequestDeleteListing, myServices[0].contractId, { listingCid: c.contractId });
    }
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Listings</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Client</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Traded Asset</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Quoted Asset</b></TableCell>
                    <TableCell key={8} className={classes.tableCell}><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listings.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.tradedInstrument.id.label}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>{c.payload.quotedInstrument.id.label}</TableCell>
                      <TableCell key={8} className={classes.tableCell}>
                        {party === c.payload.customer && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => requestDeleteDelisting(c)}>Delist</Button>}
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
