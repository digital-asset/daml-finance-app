// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../styles";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, TextField, Button, FormControl, InputLabel, Select, MenuItem, MenuProps } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Fungible } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Fungible";
import { Service as Lending } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { Message } from "../../components/Message/Message";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { useServices } from "../../context/ServicesContext";
import { BorrowOfferRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { createKey, fmt, getHolding } from "../../util";

export const Request : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ interestInstrumentLabel, setInterestInstrumentLabel ] = useState("");
  const [ interestAmount, setInterestAmount ] = useState("");
  const [ collateralInstrumentLabel, setCollateralInstrumentLabel ] = useState("");
  const [ collateralAmount, setCollateralAmount ] = useState("");

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const inst = useInstruments();
  const svc = useServices();
  const { contracts: requests, loading: l1 } = useStreamQueries(BorrowOfferRequest);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Fungible);
  const { contracts: accounts, loading: l3 } = useStreamQueries(Reference);

  const { contractId } = useParams<any>();
  const request = requests.find(b => b.contractId === contractId);
  const borrowedInstrument = inst.tokens.find(c => c.payload.id.unpack === request?.payload.borrowed.unit.id.unpack);
  const interestInstrument = inst.tokens.find(c => c.payload.id.unpack === interestInstrumentLabel);
  const collateralInstrument = inst.tokens.find(c => c.payload.id.unpack === collateralInstrumentLabel);

  if (inst.loading || svc.loading || l1 || l2 || l3) return (<Spinner />);

  const providerServices = svc.lending.filter(c => c.payload.provider === party);
  const customerServices = svc.lending.filter(c => c.payload.customer === party);
  const isProvider = providerServices.length > 0;
  const isCustomer = customerServices.length > 0;

  const myHoldings = holdings.filter(c => c.payload.account.owner === party);

  if (!isProvider && !isCustomer) return <Message text="No lending service found" />
  if (!request) return <Message text="Borrow request not found" />
  if (!borrowedInstrument) return <Message text="Borrowed instrument not found" />
  const canRequest = !!interestInstrument && !!collateralInstrument && !!interestAmount && !!collateralAmount;

  const createBorrowOffer = async () => {
    if (!interestInstrument || !collateralInstrument) throw new Error("Interest or collateral instrument not found");
    const lenderBorrowedAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === borrowedInstrument.payload.depository)?.key;
    const lenderInterestAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === interestInstrument.payload.depository)?.key;
    if (!lenderBorrowedAccount || !lenderInterestAccount) throw new Error("Borrowed or interest account not found");
    const borrowedCid = await getHolding(ledger, myHoldings, parseFloat(request.payload.borrowed.amount), request.payload.borrowed.unit);
    const arg = {
      borrowOfferRequestCid: request.contractId,
      interest: { amount: interestAmount, unit: createKey(interestInstrument!) },
      collateral: { amount: collateralAmount, unit: createKey(collateralInstrument!) },
      borrowedCid,
      lenderBorrowedAccount,
      lenderInterestAccount
    };
    await ledger.exercise(Lending.CreateBorrowOffer, svc.lending[0].contractId, arg);
    navigate("/lending/offers");
  };

  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>{request.payload.id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column">
              <Grid xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Borrow Request Details</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Borrower</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getName(request.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Lender</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{getName(request.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Id</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{request.payload.id}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Borrowed</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{fmt(request.payload.borrowed.amount)} {request.payload.borrowed.unit.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={classes.tableRow}>
                        <TableCell key={0} className={classnames(classes.tableCell, classes.width50)}><b>Maturity</b></TableCell>
                        <TableCell key={1} className={classnames(classes.tableCell, classes.width50)}>{request.payload.maturity}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
                {isProvider &&
                  <Paper className={classnames(classes.fullWidth, classes.paper)}>
                    <Typography variant="h5" className={classes.heading}>Borrow Request Details</Typography>
                    <FormControl className={classes.inputField} fullWidth>
                      <InputLabel className={classes.selectLabel}>Interest Instrument</InputLabel>
                      <Select fullWidth value={interestInstrumentLabel} onChange={e => setInterestInstrumentLabel(e.target.value as string)} MenuProps={menuProps}>
                        {inst.tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField className={classes.inputField} fullWidth label="Interest Amount" type="number" value={interestAmount} onChange={e => setInterestAmount(e.target.value as string)} />
                    <FormControl className={classes.inputField} fullWidth>
                      <InputLabel className={classes.selectLabel}>Collateral Instrument</InputLabel>
                      <Select fullWidth value={collateralInstrumentLabel} onChange={e => setCollateralInstrumentLabel(e.target.value as string)} MenuProps={menuProps}>
                        {inst.tokens.map((c, i) => (<MenuItem key={i} value={c.payload.id.unpack}>{c.payload.id.unpack}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField className={classes.inputField} fullWidth label="Collateral Amount" type="number" value={collateralAmount} onChange={e => setCollateralAmount(e.target.value as string)} />
                    <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createBorrowOffer}>Create Offer</Button>
                  </Paper>
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
