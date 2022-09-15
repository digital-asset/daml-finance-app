// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { BorrowOffer } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { fmt, getHolding } from "../../util";
import { useServices } from "../../context/ServicesContext";
import { Service as Lending } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service";
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { CreateEvent } from "@daml/ledger";

export const Offers : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const svc = useServices();

  const { contracts: offers, loading: l1 } = useStreamQueries(BorrowOffer);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l3 } = useStreamQueries(Reference);
  if (svc.loading || l1 || l2 || l3) return (<Spinner />);

  const customerServices = svc.lending.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);

  const acceptBorrowOffer = async (offer : CreateEvent<BorrowOffer>) => {
    const borrowerAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === offer.payload.borrowed.unit.depository)?.key;
    const collateralCid = await getHolding(ledger, myHoldings, parseFloat(offer.payload.collateral.amount), offer.payload.collateral.unit);
    if (!borrowerAccount) throw new Error("No suitable account found");
    const arg = {
      borrowOfferCid: offer.contractId,
      collateralCid,
      account: borrowerAccount
    };
    await ledger.exercise(Lending.AcceptBorrowOffer, svc.lending[0].contractId, arg);
    navigate("/lending/trades");
  };

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Borrow Offers</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Borrower</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Lender</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Borrowed</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Maturity</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Interest</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Collateral</b></TableCell>
                    <TableCell key={8} className={classes.tableCell}><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{fmt(c.payload.borrowed.amount, 0)} {c.payload.borrowed.unit.id.unpack}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.maturity}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>{fmt(c.payload.interest.amount, 0)} {c.payload.interest.unit.id.unpack}</TableCell>
                      <TableCell key={7} className={classes.tableCell}>{fmt(c.payload.collateral.amount, 0)} {c.payload.collateral.unit.id.unpack}</TableCell>
                      <TableCell key={8} className={classes.tableCell}>
                        {isCustomer && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => acceptBorrowOffer(c)}>Accept</Button>}
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
