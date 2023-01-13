// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../styles";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Service as Lending } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { Message } from "../../components/Message/Message";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { BorrowOfferRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { fmt } from "../../util";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";

export const Request : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ interestInstrumentLabel, setInterestInstrumentLabel ] = useState("");
  const [ interestAmount, setInterestAmount ] = useState("");
  const [ collateralInstrumentLabel, setCollateralInstrumentLabel ] = useState("");
  const [ collateralAmount, setCollateralAmount ] = useState("");

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, lending } = useServices();
  const { loading: l2, equities, tokens } = useInstruments();
  const { loading: l3, getFungible } = useHoldings();
  const { loading: l4, contracts: requests } = useStreamQueries(BorrowOfferRequest);
  const { loading: l5, contracts: accounts } = useStreamQueries(Reference);

  const { contractId } = useParams<any>();
  const request = requests.find(b => b.contractId === contractId);
  const borrowedInstrument = equities.find(c => c.payload.id.unpack === request?.payload.borrowed.unit.id.unpack);
  const interestInstrument = tokens.find(c => c.payload.id.unpack === interestInstrumentLabel);
  const collateralInstrument = tokens.find(c => c.payload.id.unpack === collateralInstrumentLabel);

  if (l1 || l2 || l3 || l4 || l5) return <Spinner />;

  const providerServices = lending.filter(c => c.payload.provider === party);
  const customerServices = lending.filter(c => c.payload.customer === party);
  const isProvider = providerServices.length > 0;
  const isCustomer = customerServices.length > 0;


  if (!isProvider && !isCustomer) return <Message text="No lending service found" />
  if (!request) return <Message text="Borrow request not found" />
  if (!borrowedInstrument) return <Message text="Borrowed instrument not found" />
  const canRequest = !!interestInstrument && !!collateralInstrument && !!interestAmount && !!collateralAmount;

  const createBorrowOffer = async () => {
    if (!interestInstrument || !collateralInstrument) throw new Error("Interest or collateral instrument not found");
    const lenderBorrowedAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === borrowedInstrument.payload.depository)?.key;
    const lenderInterestAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === interestInstrument.payload.depository)?.key;
    if (!lenderBorrowedAccount || !lenderInterestAccount) throw new Error("Borrowed or interest account not found");
    const borrowedCid = await getFungible(party, request.payload.borrowed.amount, request.payload.borrowed.unit);
    const arg = {
      borrowOfferRequestCid: request.contractId,
      interest: { amount: interestAmount, unit: interestInstrument!.key },
      collateral: { amount: collateralAmount, unit: collateralInstrument!.key },
      borrowedCid: borrowedCid as string as ContractId<Transferable>,
      lenderBorrowedAccount,
      lenderInterestAccount
    };
    await ledger.exercise(Lending.CreateBorrowOffer, lending[0].contractId, arg);
    navigate("/app/lending/offers");
  };

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant="h3" className={cls.heading}>{request.payload.id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column">
              <Grid xs={12}>
                <Paper className={classnames(cls.fullWidth, cls.paper)}>
                  <Typography variant="h5" className={cls.heading}>Borrow Request</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Borrower</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Lender</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Id</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.id}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Borrowed</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{fmt(request.payload.borrowed.amount)} {request.payload.borrowed.unit.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Maturity</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.maturity}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
                {isProvider &&
                  <Paper className={classnames(cls.fullWidth, cls.paper)}>
                    <Typography variant="h5" className={cls.heading}>Offer Details</Typography>
                    <SelectInput  label="Interest Instrument"     value={interestInstrumentLabel}   setValue={setInterestInstrumentLabel} values={toValues(tokens)} />
                    <TextInput    label="Interest Amount"         value={interestAmount}            setValue={setInterestAmount} />
                    <SelectInput  label="Collateral Instrument"   value={collateralInstrumentLabel} setValue={setCollateralInstrumentLabel} values={toValues(tokens)} />
                    <TextInput    label="Collateral Amount"       value={collateralAmount}          setValue={setCollateralAmount} />
                    <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createBorrowOffer}>Create Offer</Button>
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
