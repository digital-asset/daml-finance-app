// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../styles";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Service as LettersOfCredit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { Message } from "../../components/Message/Message";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { fmt, singleton } from "../../util";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId, emptyMap } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { LoCRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Model";
import { useAccounts } from "../../context/AccountContext";
import FileUploadComponent from './FileUploadComponent';
export const Request : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ grantedAmount, setGrantedAmount ] = useState("");
  const [ terms, setTerms] = useState("")

  const { getName } = useParties();
  const { getParty } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, loc } = useServices();
  const { loading: l2, tokens } = useInstruments(); 
  const { loading: l3, getFungible } = useHoldings();
  const { loading: l4, contracts: requests } = useStreamQueries(LoCRequest);
  // const { loading: l5, contracts: accounts } = useStreamQueries(Reference);
  const { loading: l5, accounts } = useAccounts();
  const bankAccount = accounts.find(c=> c.custodian == getParty("CentralBank"));
  const secAccount = accounts.find(c=> c.custodian == getParty("Issuer"));
  const { contractId } = useParams<any>();
  const request = requests.find(b => b.contractId === contractId);
  const currency = tokens.find(c => c.payload.id.unpack === request?.payload.requested.unit.id.unpack);

  if (l1 || l2 || l3 || l4 || l5) return <Spinner />;

  const providerServices = loc.filter(c => c.payload.provider === party);
  const customerServices = loc.filter(c => c.payload.customer === party);
  const isProvider = providerServices.length > 0;
  const isCustomer = customerServices.length > 0;
  const handleFileUploaded = (fileId: string) => {
    // Handle the uploaded file name as needed in this component
    // console.log(`File uploaded: ${fileId}`);
    setTerms(fileId)
  };
  
  if (!isProvider && !isCustomer) return <Message text="No lending service found" />
  if (!request) return <Message text="Borrow request not found" />
  if (!currency) return <Message text="Borrowed instrument not found" />
  const canRequest = !!grantedAmount && !!terms;

  const createBorrowOffer = async () => {
    const epoch = new Date(1970, 1, 1).toISOString();
    const observers = emptyMap<string, any>().set("Public", singleton(getParty("Public")));
    if(!bankAccount) return;
    if (!secAccount)return;
    const cashCid = await getFungible(party, grantedAmount, currency!.key);
    const arg = {
      loCRequestCid: request.contractId, 
      granted: { amount: grantedAmount, unit: currency!.key }, 
      observers: observers,
      lastEventTimestamp: epoch, 
      acquisitionTime: epoch, 
      terms: terms,
      cashAccountKey : bankAccount,
      secAccountKey : secAccount,
      cashCid : cashCid

    };
    await ledger.exercise(LettersOfCredit.OfferLoC, providerServices[0].contractId, arg);
    navigate("/app/loc/offers");
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
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{fmt(request.payload.requested.amount)} {request.payload.requested.unit.id.unpack}</TableCell>
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
                    <TextInput    label="Granted Amount"          value={grantedAmount}            setValue={setGrantedAmount} />
                    {/* <TextInput    label="Terms"                   value={terms}          setValue={setTerms} /> */}
                    <FileUploadComponent label="Terms"                   onFileUploaded={handleFileUploaded}/>
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
