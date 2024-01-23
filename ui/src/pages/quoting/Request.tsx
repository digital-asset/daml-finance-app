// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../styles";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { useServices } from "../../context/ServiceContext";
import { fmt } from "../../util";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { TextInput } from "../../components/Form/TextInput";
import { QuoteRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Service";
import { Aggregate } from "../../components/Instrument/Aggregate";

export const Request : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ currency, setCurrency ] = useState("");
  const [ amount, setAmount ] = useState("");

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, quoting } = useServices();
  const { loading: l2, tokens, latests } = useInstruments();
  const { loading: l3, contracts: requests } = useStreamQueries(QuoteRequest);

  const { contractId } = useParams<any>();
  const request = requests.find(b => b.contractId === contractId);
  const currencyInstrument = tokens.find(c => c.payload.id.unpack === currency);
  const instrument = latests.find(c => c.payload.id.unpack === request?.payload.quantity.unit.id.unpack);
  if (l1 || l2 || l3) return <Spinner />;

  const providerServices = quoting.filter(c => c.payload.provider === party);
  const isProvider = providerServices.length > 0;

  if (!request) return <Message text="Quote request not found" />
  if (!instrument) return <Message text="Instrument not found" />
  const canRequest = !!currencyInstrument;

  const createQuote = async () => {
    if (!currencyInstrument) throw new Error("Currency instrument not found");
    if (!providerServices) throw new Error("No quoting service found for provider " + request.payload.provider);
    const arg = {
      quoteRequestCid: request.contractId,
      price: { amount: amount, unit: currencyInstrument.key },
    };
    await ledger.exercise(Service.CreateQuote, providerServices[0].contractId, arg);
    navigate("/app/quoting/quotes");
  };

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant="h3" className={cls.heading}>{request.payload.id.unpack}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Grid container direction="column">
              <Grid xs={12}>
                <Paper className={classnames(cls.fullWidth, cls.paper)}>
                  <Typography variant="h5" className={cls.heading}>Borrow Request</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Dealer</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Customer</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Id</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Side</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.side}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Asset</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{fmt(request.payload.quantity.amount, 0)} {request.payload.quantity.unit.id.unpack}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
                {isProvider &&
                  <Paper className={classnames(cls.fullWidth, cls.paper)}>
                    <Typography variant="h5" className={cls.heading}>Quote Details</Typography>
                    <SelectInput  label="Currency"  value={currency}  setValue={setCurrency} values={toValues(tokens)} />
                    <TextInput    label="Price"     value={amount}    setValue={setAmount} />
                    <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createQuote}>Create Quote</Button>
                  </Paper>
                }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Aggregate instrument={instrument}></Aggregate>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
