// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import { Typography, Grid, Paper, Table, TableBody, TableRow, TableCell } from "@mui/material";
import useStyles from "../../pages/styles";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, claimToNode } from "../../components/Claims/util";
import { InstrumentAggregate } from "../../context/InstrumentsContext";
import { Claims } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Util";
import { useParties } from "../../context/PartiesContext";

type AggregateProps = {
  aggregate : InstrumentAggregate
};

export const Aggregate : React.FC<AggregateProps> = ({ aggregate }) => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();

  useEffect(() => {
    const setClaims = async () => {
      if (!!aggregate.claims) {
        const [res, ] = await ledger.createAndExercise(Claims.Get, { party }, { instrumentCid: aggregate.claims.contractId })
        const claims = res.length > 1 ? and(res.map(r => r.claim)) : res[0].claim;
        setNode(claimToNode(claims));
      }
    }
    setClaims();
  }, [aggregate, party, ledger]);

  const detailWidth = !!aggregate.claims ? 3 : 12;
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{aggregate.instrument.payload.description}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={detailWidth}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Typography variant="h5" className={classes.heading}>Instrument</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow key={0} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Depository</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(aggregate.instrument.payload.depository)}</TableCell>
                  </TableRow>
                  <TableRow key={1} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(aggregate.instrument.payload.issuer)}</TableCell>
                  </TableRow>
                  <TableRow key={2} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{aggregate.instrument.payload.id.unpack}</TableCell>
                  </TableRow>
                  <TableRow key={3} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Description</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{aggregate.instrument.payload.description}</TableCell>
                  </TableRow>
                  <TableRow key={4} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{aggregate.instrument.payload.version}</TableCell>
                  </TableRow>
                  <TableRow key={5} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>ValidAsOf</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{aggregate.instrument.payload.validAsOf}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
            {!!aggregate.lifecycle &&
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Typography variant="h5" className={classes.heading}>Lifecycle</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow key={0} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Lifecycler</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(aggregate.lifecycle.payload.lifecycler)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>}
          </Grid>
          {!!aggregate.claims &&
          <Grid item xs={9}>
            <Paper className={classnames(classes.fullWidth, classes.paper)}>
              <Typography variant="h5" className={classes.heading}>Claims</Typography>
              <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]} height="80vh" />
            </Paper>
          </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );
};
