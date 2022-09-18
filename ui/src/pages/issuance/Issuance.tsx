// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import classnames from "classnames";
import { Typography, Grid, Paper, Table, TableBody, TableRow, TableCell } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { Aggregate } from "../../components/Instrument/Aggregate";
import { fmt, keyEquals, keyString } from "../../util";
import { useStreamQueries } from "@daml/react";
import { Issuance as IssuanceContract } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Model";
import { useInstruments } from "../../context/InstrumentsContext";
import { useParties } from "../../context/PartiesContext";

export const Issuance : React.FC = () => {
  const classes = useStyles();
  const { getName } = useParties();
  const { contractId } = useParams<any>();
  const { loading: l1, latests } = useInstruments();
  const { loading: l2, contracts: issuances } = useStreamQueries(IssuanceContract);
  const issuance = issuances.find(c => c.contractId === contractId);
  if (l1 || l2) return <Spinner />;
  if (!issuance) return <Message text={"Issuance [" + contractId + "] not found"} />;
  const instrument = latests.find(c => keyEquals(c.key, issuance.payload.quantity.unit))
  if (!instrument) return <Message text={"Instrument [" + keyString(issuance.payload.quantity.unit) + "] not found"} />;

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{issuance.payload.description}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Paper className={classnames(classes.fullWidth, classes.paper)}>
          <Typography variant="h5" className={classes.heading}>Issuance</Typography>
          <Table size="small">
            <TableBody>
              <TableRow key={0} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Custodian</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{getName(issuance.payload.provider)}</TableCell>
              </TableRow>
              <TableRow key={1} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Issuer</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{getName(issuance.payload.customer)}</TableCell>
              </TableRow>
              <TableRow key={2} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{issuance.payload.id.unpack}</TableCell>
              </TableRow>
              <TableRow key={3} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Description</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{issuance.payload.description}</TableCell>
              </TableRow>
              <TableRow key={4} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>Quantity</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{fmt(issuance.payload.quantity.amount, 0)} {issuance.payload.quantity.unit.id.unpack}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      <Grid item xs={10}>
        <Aggregate instrument={instrument} />
      </Grid>
    </Grid>
  );
};
