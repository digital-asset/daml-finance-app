// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import useStyles from "../styles";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Grid, Paper, Typography, Table, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Service as Oracle } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Service";
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
import { PriceRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Model";

export const Request : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ price, setPrice ] = useState("");
  const [ reason, setReason ] = useState("")

  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const { loading: l1, oracle } = useServices();
  const { loading: l2, contracts: requests } = useStreamQueries(PriceRequest);

  const { contractId } = useParams<any>();
  const request = requests.find(b => b.contractId === contractId);

  if (l1 || l2) return <Spinner />;

  const providerServices = oracle.filter(c => c.payload.provider === party && c.payload.customer === request?.payload.customer);
  const customerServices = oracle.filter(c => c.payload.customer === party);
  const isProvider = providerServices.length > 0;
  const isCustomer = customerServices.length > 0;

  if (!isProvider && !isCustomer) return <Message text="No pricing service found" />
  if (!request) return <Message text="Pricing request not found" />


  const canFulfill = !!price;
  const canReject =  !!reason;

  const fulfill = async () => {
    const arg = {
      requestCid: request.contractId,
      price: price
    };
    await ledger.exercise(Oracle.FulfillPriceRequest, providerServices[0].contractId, arg );
    navigate("/app/servicing/fulfilled");
  }

  const reject = async () => {
    const arg = {
      requestCid: request.contractId,
      reason: reason
    };
    await ledger.exercise(Oracle.RejectNonLicensedPriceRequest, providerServices[0].contractId, arg );
    navigate("/app/servicing/requests");
  }

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        <Typography variant="h3" className={cls.heading}>{request.payload.instrument.id.unpack}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column">
              <Grid xs={12}>
                <Paper className={classnames(cls.fullWidth, cls.paper)}>
                  <Typography variant="h5" className={cls.heading}>Pricing Request</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow key={0} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Provider</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.provider)}</TableCell>
                      </TableRow>
                      <TableRow key={1} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Customer</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{getName(request.payload.customer)}</TableCell>
                      </TableRow>
                      <TableRow key={2} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Instrument</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.instrument.id.unpack}</TableCell>
                      </TableRow>
                      <TableRow key={3} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Mapped Instrument</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.oracleId}</TableCell>
                      </TableRow>
                      <TableRow key={4} className={cls.tableRow}>
                        <TableCell key={0} className={classnames(cls.tableCell, cls.width50)}><b>Requested</b></TableCell>
                        <TableCell key={1} className={classnames(cls.tableCell, cls.width50)}>{request.payload.requested}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
                {isProvider &&
                  <Paper className={classnames(cls.fullWidth, cls.paper)}>
                    <Typography variant="h5" className={cls.heading}>Fulfill</Typography>
                    <TextInput    label="Price"                   value={price}            setValue={setPrice} />
                    <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canFulfill} onClick={fulfill}>Go</Button>
                  </Paper>
                }
                {isProvider &&
                  <Paper className={classnames(cls.fullWidth, cls.paper)}>
                    <Typography variant="h5" className={cls.heading}>Reject</Typography>
                    <TextInput    label="Reason"                   value={reason}            setValue={setReason} />
                    <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canReject} onClick={reject}>Go</Button>
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
