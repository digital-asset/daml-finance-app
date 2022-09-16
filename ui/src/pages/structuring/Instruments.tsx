// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentsContext";

export const Instruments : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const { groups, loading } = useInstruments();
  if (loading) return (<Spinner />);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Instruments</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Depository</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Description</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Versions</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Latest</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.depository)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.issuer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.id.unpack}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.description}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{c.versions.length}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.latest.instrument.payload.validAsOf}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate(c.key)}>
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
