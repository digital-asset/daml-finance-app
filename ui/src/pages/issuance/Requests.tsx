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
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { IssueRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/IssueRequest";
import { DeissueRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/DeissueRequest";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, issuance } = useServices();
  const { loading: l2, contracts: issueRequests } = useStreamQueries(IssueRequest);
  const { loading: l3, contracts: deissueRequests } = useStreamQueries(DeissueRequest);
  if (l1 || l2 || l3) return <Spinner />;

  const issue = async (c : CreateEvent<IssueRequest>) => {
    const svc = issuance.getService(party, c.payload.customer);
    if (!svc) throw new Error("No issuance service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.Issue, svc.service.contractId, { issueRequestCid: c.contractId });
    navigate("/app/issuance/issuances");
  }

  const deissue = async (c : CreateEvent<DeissueRequest>) => {
    const svc = issuance.getService(party, c.payload.customer);
    if (!svc) throw new Error("No issuance service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.Deissue, svc.service.contractId, { deissueRequestCid: c.contractId });
    navigate("/app/issuance/issuances");
  }

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Issue Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Issuing Agent</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Issuance Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Quantity</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issueRequests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.issuanceId.unpack}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.quantity.amount}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => issue(c)}>Issue</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Deissue Requests</Typography></Grid>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deissueRequests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Client"}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.payload.issuanceId}</TableCell>
                      {/* <TableCell key={4} className={classes.tableCell}>{c.payload.accountId.label}</TableCell> */}
                      {/* <TableCell key={5} className={classes.tableCell}>{c.payload.assetId.label}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>{c.payload.quotedAssetId.label}</TableCell> */}
                      <TableCell key={7} className={classes.tableCell}>
                        {party === c.payload.provider && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => deissue(c)}>Deissue</Button>}
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>} */}
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
