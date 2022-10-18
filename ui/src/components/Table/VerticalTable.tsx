// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import useStyles from "./styles";
import { Variant } from "@mui/material/styles/createTypography";

type VerticalTableProps = {
  title : string
  variant : Variant
  headers : string[]
  values : any[]
};

export const VerticalTable : React.FC<VerticalTableProps> = ({ title, variant, headers, values }) => {
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant={variant} className={classes.tableHeader}>{title}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRowHeader}>
              {headers.map((h, i) => <TableCell key={i} className={classes.tableCell}><b>{h}</b></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {values.map((row, i) => (
              <TableRow key={i} className={classes.tableRow}>
                {row.map((v, j) => <TableCell key={j} className={classes.tableCell}>{v}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};
