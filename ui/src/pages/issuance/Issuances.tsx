// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";

export const Issuances : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();

  const { contracts: issuances, loading: l1 } = useStreamQueries(Issuance);
  if (l1) return (<Spinner />);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Issuances</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Quantity</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issuances.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.payload.quantity.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.quantity.amount}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {/* {party === c.payload.client && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => requestDelisting(c)}>Delist</Button>} */}
                      </TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/issuance/issuances/" + c.contractId)}>
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
