// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { fmt, singleton } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Instruction } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Instruction";
import { Batch as BatchI } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Batch";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Allocation, Approval } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Types";
import { useAccounts } from "../../context/AccountContext";
import { Base as Holding } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Batch : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName, getParty } = useParties();

  const { loading: l1, getAccount } = useAccounts();
  const { loading: l2, getFungible, holdings } = useHoldings();
  const { loading: l3, contracts: instructions } = useStreamQueries(Instruction);
  const { loading: l4, contracts: batches } = useStreamQueries(BatchI);

  if (l1 || l2 || l3 || l4) return <Spinner />;
  const actors = singleton(party);
  const op = getParty("Operator");
  const canSettle = batches.length > 0 && instructions.every(c => c.payload.allocation.tag !== "Unallocated" && c.payload.approval.tag !== "Unapproved");

  const allocate = async (c : CreateEvent<Instruction>) => {
    if (c.payload.routedStep.custodian === party) {
      const allocation : Allocation = { tag: "CreditReceiver", value: {} };
      await ledger.exercise(Instruction.Allocate, c.contractId, { actors, allocation });
    } else {
      const holdingCid = await getFungible(party, c.payload.routedStep.quantity.amount, c.payload.routedStep.quantity.unit);
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

  const settle = async () => {
    await ledger.exercise(BatchI.Settle, batches[0].contractId, { actors });
  };

  const createRow = (c : CreateEvent<Instruction>) : any[] => {
    const holding = holdings.find(h => (h.payload.account.owner === party || party === op) && h.payload.instrument.id.unpack === c.payload.routedStep.quantity.unit.id.unpack && parseFloat(h.payload.amount) >= parseFloat(c.payload.routedStep.quantity.amount));
    const required = !!holding || (c.payload.routedStep.sender !== party && party !== op) ? "" : <div style={{ color: "#ff5555"}}>{fmt(c.payload.routedStep.quantity.amount) + " " + c.payload.routedStep.quantity.unit.id.unpack}</div>
    const allocation = c.payload.routedStep.sender === party
      ? (c.payload.allocation.tag === "Unallocated"
        ? <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={c.payload.routedStep.sender !== party || c.payload.allocation.tag !== "Unallocated" || required !== ""} onClick={() => allocate(c)}>Allocate</Button>
        : c.payload.allocation.tag)
      : c.payload.allocation.tag;
    const approval = c.payload.routedStep.receiver === party
      ? (c.payload.approval.tag === "Unapproved"
        ? <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={c.payload.routedStep.receiver !== party || c.payload.approval.tag !== "Unapproved"} onClick={() => approve(c)}>Approve</Button>
        : c.payload.approval.tag)
      : c.payload.approval.tag;
    return [
      c.payload.id.unpack,
      getName(c.payload.routedStep.sender),
      getName(c.payload.routedStep.receiver),
      fmt(c.payload.routedStep.quantity.amount) + " " + c.payload.routedStep.quantity.unit.id.unpack,
      required,
      allocation,
      approval
    ];
  };
  const headers = ["#", "Sender", "Receiver", "Amount", "Required Funding", "Allocation", "Approval"]
  const values : any[] = instructions.map(createRow).sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <>
      <HorizontalTable title="Required Funding" variant={"h3"} headers={headers} values={values} />
      {party === op && <Button color="primary" size="large" className={classes.actionButton} variant="contained" disabled={!canSettle} onClick={settle}>Settle Atomically</Button>}
    </>
  );
};
