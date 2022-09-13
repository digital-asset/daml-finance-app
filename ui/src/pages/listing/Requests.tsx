// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { CreateListingRequest, DeleteListingRequest, Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const svc = useServices();

  const { contracts: createRequests, loading: l1 } = useStreamQueries(CreateListingRequest);
  const { contracts: disableRequests, loading: l2 } = useStreamQueries(DeleteListingRequest);
  const { contracts: listings, loading: l3 } = useStreamQueries(Listing);
  if (l1 || l2 || l3 || svc.loading) return (<Spinner />);

  const providerServices = svc.listing.filter(s => s.payload.provider === party);
  const deleteEntries = disableRequests.map(dr => ({ request: dr, listing: listings.find(l => l.contractId === dr.payload.listingCid)?.payload }));
  const createListing = async (c : CreateEvent<CreateListingRequest>) => {
    const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    if (!service) return; // TODO: Display error
    await ledger.exercise(Service.CreateListing, service.contractId, { createListingRequestCid: c.contractId });
    navigate("/listing/listings");
  }

  const deleteListing = async (c : CreateEvent<DeleteListingRequest>) => {
    const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    if (!service) return; // TODO: Display error
    await ledger.exercise(Service.DeleteListing, service.contractId, { deleteListingRequestCid: c.contractId });
    navigate("/listing/listings");
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Listing Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Customer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Traded Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Quoted Instrument</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {createRequests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Client"}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.tradedInstrument.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.quotedInstrument.id.unpack}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => createListing(c)}>List</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
                      </TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/listing/createrequest/" + c.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Delisting Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Customer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Traded Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Quoted Instrument</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deleteEntries.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.request.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.request.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{party === c.request.payload.provider ? "Provider" : "Client"}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.listing?.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.listing?.tradedInstrument.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.listing?.quotedInstrument.id.unpack}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {party === c.request.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => deleteListing(c.request)}>Delist</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
                      </TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/listing/deleterequest/" + c.request.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
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
