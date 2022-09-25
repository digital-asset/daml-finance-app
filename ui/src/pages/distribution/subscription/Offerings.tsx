// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Offering } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Model";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";

export const Offerings : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();

  const { contracts: offerings, loading: l1 } = useStreamQueries(Offering);
  if (l1) return <Spinner />;

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Subscriptions</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Agent</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Asset</b></TableCell>
                    <TableCell key={4} className={classes.tableCell} align="right"><b>Price</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offerings.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.issuer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.offeringId}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{fmt(c.payload.asset.amount)} {c.payload.asset.unit.id.unpack}</TableCell>
                      <TableCell key={4} className={classes.tableCell} align="right">{fmt(c.payload.price.amount, 4)} {c.payload.price.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/distribution/subscriptions/" + c.contractId)}>
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
