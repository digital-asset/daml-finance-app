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
import { CreateIssuanceRequest, ReduceIssuanceRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Account } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Account";
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

  const { contracts: createRequests, loading: l1 } = useStreamQueries(CreateIssuanceRequest);
  const { contracts: reduceRequests, loading: l2 } = useStreamQueries(ReduceIssuanceRequest);
  const { contracts: accounts, loading: l3 } = useStreamQueries(Account);
  const providerServices = svc.issuance.filter(s => s.payload.provider === party);

  if (l1 || l2 || l3 || svc.loading || providerServices.length === 0) return (<Spinner />);

  const createIssuance = async (c : CreateEvent<CreateIssuanceRequest>) => {
    const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    const account = accounts.find(c => c.payload.custodian === party && c.payload.owner === party);
    if (!service || !account) return;
    await ledger.exercise(Service.CreateIssuance, service.contractId, { createIssuanceRequestCid: c.contractId });
    navigate("/issuance/issuances");
  }

  const deleteIssuance = async (c : CreateEvent<ReduceIssuanceRequest>) => {
    const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    if (!service) return;
    await ledger.exercise(Service.ReduceIssuance, service.contractId, { reduceIssuanceRequestCid: c.contractId });
    navigate("/issuance/issuances");
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Issuance Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Issuing Agent</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Issuance ID</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Quantity</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {createRequests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.quantity.amount}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => createIssuance(c)}>Issue</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
                      </TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/issuance/createrequest/" + c.contractId)}>
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
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Deissuance Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Client</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Issuance ID</b></TableCell>
                    {/* <TableCell key={4} className={classes.tableCell}><b>Account</b></TableCell> */}
                    {/* <TableCell key={5} className={classes.tableCell}><b>Asset</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Quantity</b></TableCell> */}
                    <TableCell key={7} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={8} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reduceRequests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Client"}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.payload.id}</TableCell>
                      {/* <TableCell key={4} className={classes.tableCell}>{c.payload.accountId.label}</TableCell> */}
                      {/* <TableCell key={5} className={classes.tableCell}>{c.payload.assetId.label}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>{c.payload.quotedAssetId.label}</TableCell> */}
                      <TableCell key={7} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => deleteIssuance(c)}>Deissue</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
                      </TableCell>
                      <TableCell key={8} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/issuance/deleterequest/" + c.contractId)}>
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
