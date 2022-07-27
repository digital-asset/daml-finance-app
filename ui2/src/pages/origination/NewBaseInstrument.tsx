// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, TextField, Button } from "@mui/material";
import classnames from "classnames";
import { useLedger, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { nodeToClaim } from "../../components/Claims/util";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../components/Claims/ClaimsTreeBuilder";
import { RequestOrigination, Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Instrument } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Spinner } from "../../components/Spinner/Spinner";
import { Message } from "../../components/Message/Message";

export const NewBaseInstrument : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ label, setLabel ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode | undefined>({ id: uuidv4(), tag: "Zero", type: "Claim", children: [] });
  const canRequest = !!label;

  const ledger = useLedger();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: assets, loading: l2 } = useStreamQueries(Instrument);
  const ids = assets.map(c => c.contractId);

  if (l1 || l2) return <Spinner />;
  if (services.length === 0) return <Message message="No issuance service found" />

  const requestOrigination = async () => {
    if (!node) return;
    const arg : RequestOrigination = {
      assetLabel: label,
      description: label,
      cfi: { code: "XXXXXX" },
      claims: nodeToClaim(node, ids),
      observers: [ "Public" ] // TODO: consolidate getting public party somewhere
    }
    await ledger.exercise(Service.RequestOrigination, services[0].contractId, arg);
    navigate("/origination/requests");
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3" className={classes.heading}>New Base Asset</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Parameters</Typography>
                  <TextField className={classes.inputField} fullWidth label="Id" type="text" value={label} onChange={e => setLabel(e.target.value as string)} />
                  <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestOrigination}>Request Origination</Button>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <Typography variant="h5" className={classes.heading}>Payoff</Typography>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={[]}/>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
