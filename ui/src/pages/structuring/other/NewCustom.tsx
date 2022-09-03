// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Button, TextField } from "@mui/material";
import useStyles from "../../styles";
import { Instrument } from "@daml.js/daml-finance-instrument-base/lib/Daml/Finance/Instrument/Base/Instrument";
import { Instrument as Generic } from "@daml.js/daml-finance-instrument-generic/lib/Daml/Finance/Instrument/Generic/Instrument";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { ClaimsTreeBuilder, ClaimTreeNode } from "../../../components/Claims/ClaimsTreeBuilder";
import { nodeToClaim } from "../../../components/Claims/util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { createKey, singleton } from "../../../util";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";

export const NewCustom : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ node, setNode ] = useState<ClaimTreeNode>({ id: uuidv4(), tag: "Claim", type: "Claim", children: [] });

  const { getParty } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { contracts: services, loading: l1 } = useStreamQueries(Service);
  const { contracts: instruments, loading: l2 } = useStreamQueries(Instrument);
  if (l1 || l2) return (<Spinner />);

  const keys = instruments.map(createKey);
  const customerServices = services.filter(s => s.payload.customer === party);

  const requestOrigination = async () => {
    if (!node || node.tag === "Claim") return;
    const claims = nodeToClaim(node);
    if (customerServices.length === 0) return;
    const arg = {
      depository: party,
      issuer: party,
      id: { unpack: id },
      description: "",
      version: uuidv4(),
      claims,
      observers: emptyMap<string, any>().set("Public", singleton(singleton(getParty("Public")))),
      acquisitionTime: new Date(1970, 1, 1).toISOString(),
      lastEventTimestamp: new Date(1970, 1, 1).toISOString()
    }
    await ledger.create(Generic, arg);
    navigate("/structuring/instruments");
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.heading}>New Custom Instrument</Typography>
      </Grid>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={4} />
        <Grid item xs={4}>
          <TextField className={classes.inputField} InputLabelProps={{ className: classes.inputFieldPlaceholder }} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
        </Grid>
        <Grid item xs={4} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={12}>
                <Paper className={classnames(classes.fullWidth, classes.paper)}>
                  <ClaimsTreeBuilder node={node} setNode={setNode} assets={keys} readonly={false} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!node || node.tag === "Claim"} onClick={requestOrigination}>Originate</Button>
      </Grid>
    </Grid>
  );
};
