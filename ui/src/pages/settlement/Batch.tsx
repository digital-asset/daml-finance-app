// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHead, Grid, Paper, Typography, Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { fmt, shorten, singleton } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Batch as BatchI } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Batch";
import { Instruction } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Instruction";
import { useParams } from "react-router-dom";
import { Message } from "../../components/Message/Message";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Allocation, Approval } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Types";
import { useAccounts } from "../../context/AccountContext";
import { Holding } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Holding";

export const Batch : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();

  const { loading: l1, getAccount } = useAccounts();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: batches } = useStreamQueries(BatchI);
  const { loading: l4, contracts: instructions } = useStreamQueries(Instruction);
  const { contractId } = useParams<any>();
  const batch = batches.find(c => c.contractId === contractId);

  if (l1 || l2 || l3 || l4) return <Spinner />;
  if (!batch) return <Message text={"Batch [" + contractId + "] not found"} />;
  const filtered = instructions.filter(c => c.payload.batchId.unpack === batch.payload.id.unpack).sort((a, b) => a.payload.id.unpack.localeCompare(b.payload.id.unpack));
  const actors = singleton(party);

  const allocate = async (c : CreateEvent<Instruction>) => {
    if (c.payload.routedStep.custodian === party) {
      const allocation : Allocation = { tag: "CreditReceiver", value: {} };
      await ledger.exercise(Instruction.Allocate, c.contractId, { actors, allocation });
    } else {
      const holdingCid = await getFungible(party, c.payload.routedStep.quantity.amount, c.payload.routedStep.quantity.unit, c.payload.routedStep.custodian);
      const allocation : Allocation = { tag: "Pledge", value: holdingCid as string as ContractId<Holding> };
      await ledger.exercise(Instruction.Allocate, c.contractId, { actors, allocation });
    };
  };

  const approve = async (c : CreateEvent<Instruction>) => {
    if (c.payload.routedStep.custodian === party) {
      const approval : Approval = { tag: "DebitSender", value: {} };
      await ledger.exercise(Instruction.Approve, c.contractId, { actors, approval });
    } else {
      const account = getAccount(c.payload.routedStep.quantity.unit);
      const approval : Approval = { tag: "TakeDelivery", value: account };
      await ledger.exercise(Instruction.Approve, c.contractId, { actors, approval });
    };
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h5">Settlement Instructions</Typography></Grid>
            <Table size="small">
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell key={0} className={classes.tableCell}><b>Id</b></TableCell>
                  <TableCell key={1} className={classes.tableCell}><b>Sender</b></TableCell>
                  <TableCell key={2} className={classes.tableCell}><b>Receiver</b></TableCell>
                  <TableCell key={3} className={classes.tableCell} align="right"><b>Quantity</b></TableCell>
                  <TableCell key={4} className={classes.tableCell}><b>Instrument</b></TableCell>
                  <TableCell key={5} className={classes.tableCell}><b>Allocation</b></TableCell>
                  <TableCell key={6} className={classes.tableCell}><b>Approval</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c, i) => (
                  <TableRow key={i} className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}>{c.payload.id.unpack}</TableCell>
                    <TableCell key={1} className={classes.tableCell}>{getName(c.payload.routedStep.sender)}</TableCell>
                    <TableCell key={2} className={classes.tableCell}>{getName(c.payload.routedStep.receiver)}</TableCell>
                    <TableCell key={3} className={classes.tableCell} align="right">{fmt(c.payload.routedStep.quantity.amount, 2)}</TableCell>
                    <TableCell key={4} className={classes.tableCell}>{c.payload.routedStep.quantity.unit.id.unpack} (v{shorten(c.payload.routedStep.quantity.unit.version)})</TableCell>
                    <TableCell key={5} className={classes.tableCell}>
                      {c.payload.routedStep.sender === party && c.payload.allocation.tag === "Unallocated" && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={c.payload.routedStep.sender !== party || c.payload.allocation.tag !== "Unallocated"} onClick={() => allocate(c)}>Allocate</Button>}
                      {(c.payload.routedStep.sender !== party || c.payload.allocation.tag !== "Unallocated") && c.payload.allocation.tag}
                    </TableCell>
                    <TableCell key={6} className={classes.tableCell}>
                      {c.payload.routedStep.receiver === party && c.payload.approval.tag === "Unapproved" && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={c.payload.routedStep.receiver !== party || c.payload.approval.tag !== "Unapproved"} onClick={() => approve(c)}>Approve</Button>}
                      {(c.payload.routedStep.receiver !== party || c.payload.approval.tag !== "Unapproved") && c.payload.approval.tag}
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
