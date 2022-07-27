// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography } from "@mui/material";
import { useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { AssetDeposit } from "@daml.js/daml-finance-app/lib/DA/Finance/Asset";
import { AssetDescription } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/AssetDescription";
import { getDatedCashflows } from "../../components/Claims/util";
import { renderCashflows } from "../../components/Claims/renderCashflows";
import { Fixing } from "@daml.js/daml-finance-app/lib/DA/Finance/RefData/Fixing";

export const Cashflows : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const el = useRef<HTMLDivElement>(null);

  const { contracts: deposits, loading: l1 } = useStreamQueries(AssetDeposit);
  const { contracts: instruments, loading: l2 } = useStreamQueries(AssetDescription);
  const { contracts: fixings, loading: l3 } = useStreamQueries(Fixing);

  useEffect(() => {
    if (l1 || l2 || l3 || !el.current) return;
    const spots : any = {};
    for (var x = 0; x < fixings.length; x++) {
      if (!spots[fixings[x].payload.id.label]) spots[fixings[x].payload.id.label] = {};
      spots[fixings[x].payload.id.label][fixings[x].payload.date] = fixings[x].payload.value;
    }

    var allCashflows : any[] = [];
    for (var j = 0; j < deposits.length; j++) {
      const deposit = deposits[j];
      const instrument = instruments.find(c => c.payload.assetId.label === deposit.payload.asset.id.label);
      if (!instrument) continue;
      const datedCashflows = getDatedCashflows(instrument.payload.claims, spots);
      const annotated = datedCashflows.map((dcf : any) => ({ date: dcf.date, cashflows: dcf.cashflows.map((cf : any) => ({ cashflow: cf * parseFloat(deposit.payload.asset.quantity), label: instrument.payload.assetId.label, contractId: deposit.contractId })) }));
      for (var i = 0; i < annotated.length; i++) {
        const a = annotated[i];
        const existing = allCashflows.find(acf => acf.date === a.date);
        if (!!existing) existing.cashflows = existing.cashflows.concat(a.cashflows);
        else allCashflows.push(a);
      }
    }

    allCashflows.sort((a, b) => (a.date > b.date) ? 1 : -1)
    renderCashflows(el.current, allCashflows, navigate, 600, false);
  }, [el, l1, l2, l3, instruments, deposits, fixings, navigate]);

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h5" className={classes.heading}>Portfolio Cashflows</Typography>
              <div ref={el} style={{ height: "100%" }}/>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
