// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import useStyles from "./styles";
import { Variant } from "@mui/material/styles/createTypography";

export type Alignment = "inherit" | "left" | "center" | "right" | "justify";

type HorizontalTableProps = {
  title? : string
  variant? : Variant
  headers : string[]
  values : any[][]
  alignment? : Alignment[]
}

export const HorizontalTable : React.FC<HorizontalTableProps> = ({ title, variant, headers, values, alignment }) => {
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        {!!title && <Typography variant={variant || "h1"} className={classes.tableHeader}>{title}</Typography>}
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRowHeader}>
              {headers.map((h, i) => <TableCell key={i} className={classes.tableCell} align={!!alignment ? alignment[i] : "left"}><b>{h}</b></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {values.length === 0 && <TableCell key={0} className={classes.tableCell} align={"center"} colSpan={headers.length}>No data provided.</TableCell>}
            {values.length > 0 && values.map((row, i) => (
              <TableRow key={i} className={classes.tableRow}>
                {row.map((v, j) => <TableCell key={j} className={classes.tableCell} align={!!alignment ? alignment[j] : "left"}>{v}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};
