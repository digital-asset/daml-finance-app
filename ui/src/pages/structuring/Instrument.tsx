// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import { Typography, Grid, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { and, claimToNode } from "../../components/Claims/util";
import { id } from "../../util";
import { useInstruments } from "../../context/InstrumentsContext";
import { useServices } from "../../context/ServicesContext";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";

export const Instrument : React.FC = () => {
  const classes = useStyles();

  const ledger = useLedger();
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>();
  const { contractId } = useParams<any>();
  const cid = contractId?.replace("_", "#");
  const inst = useInstruments();
  const svc = useServices();
  const instrument = inst.all.find(c => c.contractId === cid);

  useEffect(() => {
    const setClaims = async () => {
      if (!!instrument && svc.structuring.length > 0) {
        const [res, ] = await ledger.exercise(Service.GetClaims, svc.structuring[0].contractId, { instrumentCid: instrument.contractId })
        const claims = and(res.map(r => r.claim));
        setNode(claimToNode(claims));
      }
    }
    setClaims();
  }, [instrument, ledger, svc]);

  if (inst.loading || !instrument) return (<Spinner />);

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
