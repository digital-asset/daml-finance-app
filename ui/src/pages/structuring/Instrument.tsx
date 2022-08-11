// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { claimToNode } from "../../components/Claims/util";
import { id } from "../../util";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();
  const { contractId } = useParams<any>();
  const cid = contractId?.replace("_", "#");

  const { contracts: instruments, loading: l1 } = useStreamQueries(Derivative);
  const instrument = instruments.find(c => c.contractId === cid);

  useEffect(() => {
    if (!!instrument) setNode(claimToNode(instrument.payload.claims));
  }, [instrument]);

  if (l1 || !instrument) return (<Spinner />);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>{id(instrument.payload.id)}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Claims</Typography>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]} height="80vh" />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
