// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, IconButton, Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { keyEquals, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { CreateEvent } from "@daml/ledger";
import { useParties } from "../../context/PartiesContext";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { Claim } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Claim";
import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";

export const Effects : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const navigate = useNavigate();
  const { getName } = useParties();

  const { contracts: effects, loading: l1 } = useStreamQueries(Effect);
  const { contracts: holdings, loading: l2 } = useStreamQueries(Base);
  const { contracts: claimRules, loading: l3 } = useStreamQueries(Claim);

  if (l1 || l2 || l3) return (<Spinner />);

  const claimAll = async () => {
    const claimEffect = async (effect : CreateEvent<Effect>) => {
      const holdingCids = holdings.filter(c => keyEquals(c.payload.instrument, effect.payload.targetInstrument)).map(c => c.contractId);
      const arg = {
        claimer: party,
        holdingCids,
        effectCid: effect.contractId
      }
      await ledger.exercise(Claim.ClaimEffect, claimRules[0].contractId, arg);
    };
    await Promise.all(effects.map(claimEffect));
    navigate("/servicing/settlement");
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Effects</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Provider</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Id</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Description</b></TableCell>
                  <TableCell key={3} className={classes.tableCell}><b>Target</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Produced</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Holdings</b></TableCell>
                  <TableCell key={6} className={classes.tableCell}><b>Holdings</b></TableCell>
                  <TableCell key={7} className={classes.tableCell}>
                    <Button className={classes.choiceButton} size="large" variant="contained" color="primary" disabled={false} onClick={claimAll}>Claim All</Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {effects.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{c.payload.id.unpack}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{c.payload.description}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{c.payload.targetInstrument.id.unpack} ({shorten(c.payload.targetInstrument.version)})</TableCell>
                    <TableCell key={3} className={classes.tableCell}>{c.payload.producedInstrument && c.payload.targetInstrument.id.unpack + " (" + shorten(c.payload.producedInstrument.version) + ")"}</TableCell>
                    <TableCell key={6} className={classes.tableCell}>{holdings.filter(h => keyEquals(c.payload.targetInstrument, h.payload.instrument)).length}</TableCell>
                    <TableCell key={7} className={classes.tableCell}>
                      <IconButton color="primary" size="small" component="span" onClick={() => navigate("/servicing/effects/" + c.contractId)}>
                        <KeyboardArrowRight fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
