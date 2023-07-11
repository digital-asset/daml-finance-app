// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger,  useParty,  useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper } from "@mui/material";
import useStyles from "./styles";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, claimToNode } from "../../components/Claims/util";
import { InstrumentAggregate } from "../../context/InstrumentContext";
import { Service as Lifecycle } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { Spinner } from "../Spinner/Spinner";
import { useServices } from "../../context/ServiceContext";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";

type AggregateProps = {
  instrument : InstrumentAggregate
};

export const Aggregate : React.FC<AggregateProps> = ({ instrument }) => {
  const classes = useStyles();
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, lifecycle } = useServices();
  const { loading: l2, contracts: observables } = useStreamQueries(NumericObservable);
  const lc = lifecycle.find(c => c.payload.customer === party);

  useEffect(() => {
    const setClaims = async () => {
      if (!l1 && !l2 && !!lc && !!instrument.claim) {
        const [res, ] = await ledger.exercise(Lifecycle.GetCurrentClaims, lc.contractId, { instrumentCid: instrument.claim.contractId, observableCids: observables.map(c => c.contractId) })
        const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
        setNode(claimToNode(claims));
      }
    }
    setClaims();
  }, [lc, instrument, observables, l1, l2, ledger]);

  if (l1 || l2) return <Spinner />

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {!!instrument.claim &&
          <Grid item xs={12}>
            <Typography variant="h5" className={classes.tableHeader}>Payoff</Typography>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]} height="70vh" />
            </Paper>
          </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );
};
