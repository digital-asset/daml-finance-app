// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardContent, Grid, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "./styles";
import { fmt } from "../../util";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Decentralized/Exchange/Service";
import { useParties } from "../../context/PartiesContext";

type DexProps = {
  service : Service
}

export const Dex : React.FC<DexProps> = ({ service: dex }) => {
  const classes = useStyles();
  const navigate = useNavigate()
  const { getName } = useParties();

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card className={classes.card}>
        <Box border={1} borderColor="primary.main" style={{ height: "100%"}}>
          <CardActionArea onClick={() => navigate(dex.id.unpack)}>
            {/* <CardMedia className={classes.cardMedia} image={image} title={label} /> */}
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2" className={classes.cardText}>{dex.p1.quantity.unit.id.unpack} / {dex.p2.quantity.unit.id.unpack}</Typography>
              {/* <Typography variant="body2" color="textPrimary" component="p" className={classes.cardText}>{description}</Typography> */}
              <Table size="small">
                <TableBody>
                  <TableRow key={0} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellMini}><b>Consortium</b></TableCell>
                    <TableCell key={1} className={classes.tableCellMini}>{getName(dex.consortium)}</TableCell>
                  </TableRow>
                  <TableRow key={1} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellMini}><b>Share Id</b></TableCell>
                    <TableCell key={1} className={classes.tableCellMini}>{dex.shares.unit.id.unpack}</TableCell>
                  </TableRow>
                  <TableRow key={2} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellMini}><b>Shares Issued</b></TableCell>
                    <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(dex.shares.amount, 0)}</TableCell>
                  </TableRow>
                  <TableRow key={4} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellMini}><b>{dex.p1.quantity.unit.id.unpack} Pool Size</b></TableCell>
                    <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(dex.p1.quantity.amount, 0)}</TableCell>
                  </TableRow>
                  <TableRow key={5} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCellMini}><b>{dex.p2.quantity.unit.id.unpack} Pool Size</b></TableCell>
                    <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(dex.p2.quantity.amount, 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
    </Grid>
  );
};

