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
import { useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Instrument } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Spinner } from "../../components/Spinner/Spinner";
import { version } from "../../util";
import { useParties } from "../../context/PartiesContext";

export const Instruments : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const { contracts: instruments, loading: l1 } = useStreamQueries(Instrument);
  if (l1) return (<Spinner />);

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
                    <TableCell key={0} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Depository</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instruments.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.issuer)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.depository)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id.label}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{version(c.payload.id)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate(c.contractId)}>
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
