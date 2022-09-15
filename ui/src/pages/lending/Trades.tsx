// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { BorrowAgreement } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { fmt, getHolding } from "../../util";
import { useServices } from "../../context/ServicesContext";
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { CreateEvent } from "@daml/ledger";

export const Trades : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const svc = useServices();

  const { contracts: trades, loading: l1 } = useStreamQueries(BorrowAgreement);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Fungible);
  if (svc.loading || l1 || l2) return (<Spinner />);

  const customerServices = svc.lending.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);

  const repay = async (trade : CreateEvent<BorrowAgreement>) => {
    const borrowedCid = await getHolding(ledger, myHoldings, parseFloat(trade.payload.borrowed.amount), trade.payload.borrowed.unit);
    const interestCid = await getHolding(ledger, myHoldings, parseFloat(trade.payload.interest.amount), trade.payload.interest.unit);
    const arg = {
      borrowedCid,
      interestCid
    };
    await ledger.exercise(BorrowAgreement.Repay, trade.contractId, arg);
  };

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Live Trades</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={1} className={classes.tableCell}><b>Borrower</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Lender</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Borrowed</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Maturity</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Interest</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Collateral</b></TableCell>
                    <TableCell key={8} className={classes.tableCell}><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trades.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{fmt(c.payload.borrowed.amount, 0)} {c.payload.borrowed.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.maturity}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>{fmt(c.payload.interest.amount, 0)} {c.payload.interest.unit.id.unpack}</TableCell>
                      <TableCell key={7} className={classes.tableCell}>{fmt(c.payload.collateral.amount, 0)} {c.payload.collateral.unit.id.unpack}</TableCell>
                      <TableCell key={8} className={classes.tableCell}>
                        {isCustomer && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => repay(c)}>Repay</Button>}
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
