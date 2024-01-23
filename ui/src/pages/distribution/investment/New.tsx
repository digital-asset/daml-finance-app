// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Button } from "@mui/material";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { useServices } from "../../../context/ServiceContext";
import { Service as Investment } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Investment/Service";
import { Message } from "../../../components/Message/Message";
import { useHoldings } from "../../../context/HoldingContext";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput } from "../../../components/Form/SelectInput";
import { Fund } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Model";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { useParties } from "../../../context/PartiesContext";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ fundId, setFundId ] = useState("");
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { getName } = useParties();

  const { loading: l1, investment } = useServices();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: funds } = useStreamQueries(Fund);
  if (l1 || l2 || l3) return <Spinner />;

  const myServices = investment.filter(s => s.payload.customer === party);
  const fund = funds.find(c => c.payload.id.unpack === fundId);
  const canRequest = !!fundId && !!amount;
  const amountLabel = "Amount (" + (!!fund ? fund.payload.currency.id.unpack : "CCY") + ")";
  const fundValues = funds.map(c => ({ value: c.payload.id.unpack, display: c.payload.id.unpack + " - " + c.payload.description }));
  if (myServices.length === 0) return <Message text={"No investment service found for customer: " + party} />;

  const requestInvestment = async () => {
    if (!fund) return;
    const cashCid = await getFungible(party, amount, fund.payload.currency);
    const today = new Date().toISOString().substring(0, 10);
    const requestId = "REQ/" + fund.payload.id.unpack + "/" + getName(party) + "/" + today;
    const arg = {
      requestId: { unpack: requestId },
      asOfDate: today,
      fundCid: fund.contractId,
      cashCid: cashCid as string as ContractId<Transferable>
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
