// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { useStreamQueries } from "@daml/react";
import { Table, TableBody, TableCell, TableRow, TableHead } from "@mui/material";
import useStyles from "../styles";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { Service as CustodyService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Custody/Service"
import { getName } from "../../util";

export const Overview : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const entries = useStreamQueries(CustodyService).contracts;

  return (
    <Table size="small">
      <TableHead>
        <TableRow className={classes.tableRow}>
          <TableCell key={0} className={classes.tableCell}><b>Operator</b></TableCell>
          <TableCell key={1} className={classes.tableCell}><b>Provider</b></TableCell>
          <TableCell key={2} className={classes.tableCell}><b>Consumer</b></TableCell>
          <TableCell key={6} className={classes.tableCell}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map((e, i) => (
          <TableRow key={i} className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>{getName(e.payload.operator)}</TableCell>
            <TableCell key={1} className={classes.tableCell}>{getName(e.payload.provider)}</TableCell>
            <TableCell key={2} className={classes.tableCell}>{getName(e.payload.customer)}</TableCell>
            <TableCell key={6} className={classes.tableCell}>
              <IconButton color="primary" size="small" component="span" onClick={() => navigate("/network/services/" + e.contractId)}>
                <KeyboardArrowRight fontSize="small"/>
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
