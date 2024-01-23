// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
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
          <TableBody className={classes.tableBody}>
            {headers.map((h, i) => (
              <TableRow key={i} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}><b>{h}</b></TableCell>
                <TableCell key={1} className={classes.tableCell}>{values[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};
