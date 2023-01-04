// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger,  useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper } from "@mui/material";
import useStyles from "./styles";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, claimToNode } from "../../components/Claims/util";
import { InstrumentAggregate } from "../../context/InstrumentContext";
import { Service as Lifecycle } from "@daml.js/daml-finance-app-interface-lifecycle/lib/Daml/Finance/App/Interface/Lifecycle/Service";
import { useParties } from "../../context/PartiesContext";
import { shorten } from "../../util";
import { Spinner } from "../Spinner/Spinner";
import { useServices } from "../../context/ServicesContext";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { VerticalTable } from "../Table/VerticalTable";

type AggregateProps = {
  instrument : InstrumentAggregate
};

export const Aggregate : React.FC<AggregateProps> = ({ instrument }) => {
  const classes = useStyles();
  const { getName } = useParties();
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();
  const ledger = useLedger();
  const { loading: l1, lifecycle } = useServices();
  const { loading: l2, contracts: observables } = useStreamQueries(NumericObservable);

  useEffect(() => {
    const setClaims = async () => {
      if (!l1 && !l2 && !!instrument.claim) {
        const [res, ] = await ledger.exercise(Lifecycle.GetCurrentClaims, lifecycle.services[0].service.contractId, { instrumentCid: instrument.claim.contractId, observableCids: observables.map(c => c.contractId) })
        const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
        setNode(claimToNode(claims));
      }
    }
    if (lifecycle.services.length > 0) setClaims();
  }, [lifecycle, instrument, observables, l1, l2, ledger]);

  if (l1 || l2) return <Spinner />

  const headers = ["Depository", "Issuer", "Id", "Description", "Version", "ValidAsOf"];
  const values : any[] = [
    getName(instrument.payload.depository),
    getName(instrument.payload.issuer),
    instrument.payload.id.unpack,
    instrument.payload.description,
    shorten(instrument.payload.version),
    instrument.payload.validAsOf
  ];

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <VerticalTable title="Instrument" variant={"h5"} headers={headers} values={values} />
          </Grid>
          {!!instrument.claim &&
          <Grid item xs={9}>
            <Typography variant="h5" className={classes.tableHeader}>Claims</Typography>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]} height="50vh" />
            </Paper>
          </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );
};
