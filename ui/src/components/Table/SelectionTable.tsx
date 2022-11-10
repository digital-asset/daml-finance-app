// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { Box, Button, Checkbox, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import useStyles from "./styles";
import { Variant } from "@mui/material/styles/createTypography";

export type Alignment = "inherit" | "left" | "center" | "right" | "justify";

type SelectionTableProps = {
  title : string
  variant : Variant
  headers : string[]
  values : any[][]
  alignment? : Alignment[]
  action : string
  onExecute : (values : any[]) => Promise<void>
  callbackValues : any[]
}

export const SelectionTable : React.FC<SelectionTableProps> = ({ title, variant, headers, values, alignment, action, onExecute, callbackValues }) => {
  const classes = useStyles();

  const [selected, setSelected] = useState<number[]>([]);

  const onToggleAll = (checked : boolean) => {
    if (checked) {
      setSelected(values.map((_, i) => i));
    } else {
      setSelected([]);
    }
  };

  const onToggle = (i : number) => {
    if (selected.includes(i)) {
      setSelected(selected.filter(n => n !== i));
    } else {
      setSelected(selected.concat([i]));
    }
  };

  const onExecuteAll = async () => {
    const filtered = callbackValues.filter((_, i) => selected.includes(i));
    await onExecute(filtered);
    setSelected([]);
  };

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant={variant} className={classes.tableHeader}>{title}</Typography>
        <Box component="span" className={classes.actionBox}>
          <Typography variant="body1" display="inline">{selected.length} selected</Typography>
          <Button className={classes.actionButton} color="primary" variant="contained" disabled={selected.length === 0} onClick={() => onExecuteAll()}>{action}</Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRowHeader}>
              <TableCell key={"sel"} className={classes.tableCell} align="left" padding="checkbox">
                <Checkbox className={classes.selectBox} color="primary" indeterminate={selected.length > 0 && selected.length < values.length} checked={values.length > 0 && selected.length === values.length} onChange={(e, c) => onToggleAll(c)} />
              </TableCell>
              {headers.map((h, i) => <TableCell key={i} className={classes.tableCell} align={!!alignment ? alignment[i] : "left"}><b>{h}</b></TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {values.length === 0 && <TableCell key={0} className={classes.tableCell} align={"center"} colSpan={headers.length + 1}>No data provided.</TableCell>}
            {values.length > 0 && values.map((row, i) => (
              <TableRow key={i} className={classes.tableRow}>
                <TableCell key={"sel"} className={classes.tableCell} align="left" padding="checkbox">
                  <Checkbox className={classes.selectBox} color="primary" checked={selected.includes(i)} onChange={() => onToggle(i)} />
                </TableCell>
                {row.map((v, j) => <TableCell key={j} className={classes.tableCell} align={!!alignment ? alignment[j] : "left"}>{v}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};
