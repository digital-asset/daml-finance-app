// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Select, MenuItem, TextField, Button, MenuProps, FormControl, InputLabel } from "@mui/material";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { createSet } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Investment } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Investment/Service";
import { Message } from "../../../components/Message/Message";
import { useHoldings } from "../../../context/HoldingContext";
import { Fund } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Investment/Model";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput } from "../../../components/Form/SelectInput";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ requestId, setRequestId ] = useState("");
  const [ fundId, setFundId ] = useState("");
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, investment } = useServices();
  const { loading: l2, tokens } = useInstruments();
  const { loading: l3, getFungible } = useHoldings();
  const { loading: l4, contracts: funds } = useStreamQueries(Fund);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const myServices = investment.filter(s => s.payload.customer === party);
  const fund = funds.find(c => c.payload.id.unpack === fundId);
  const canRequest = !!requestId && !!fundId && !!amount;
  const amountLabel = "Amount (" + (!!fund ? fund.payload.currency.id.unpack : "CCY") + ")";
  const fundValues = funds.map(c => ({ value: c.payload.id.unpack, display: c.payload.id.unpack + " - " + c.payload.description }));
  if (myServices.length === 0) return <Message text={"No investment service found for customer: " + party} />;

  const requestInvestment = async () => {
    if (!fund) return;
    const cashCid = await getFungible(party, amount, fund.payload.currency);
    // const receivableAccount = accounts.find(c => c.payload.accountView.custodian === currency.payload.depository && c.payload.accountView.owner === party)?.key;
    // if (!receivableAccount) return;
    const arg = {
      requestId: { unpack: requestId },
      fundCid: fund.contractId,
      cashCid
    };
    await ledger.exercise(Investment.RequestInvestment, myServices[0].contractId, arg);
    navigate("/app/distribution/investmentrequests");
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>New Investment</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              <TextInput    label="RequestId"   value={requestId} setValue={setRequestId} />
              <SelectInput  label="Fund"        value={fundId}    setValue={setFundId}  values={fundValues} />
              <TextInput    label={amountLabel} value={amount}    setValue={setAmount} />
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestInvestment}>Request Investment</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
