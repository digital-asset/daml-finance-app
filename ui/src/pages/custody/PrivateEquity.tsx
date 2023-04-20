// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty } from "@daml/react";
import { fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useHoldings } from "../../context/HoldingContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { Button, TextField } from "@mui/material";
import useStyles from "../styles";

export type HoldingsProps = {
}

type PositionEntry = {
  custodian : string
  owner : string
  instrument : string
  version : string
  position : number
  locked : number
  available : number
  commitment: number
}

const positionEntryCmp = (p1: PositionEntry, p2: PositionEntry) => {
  if (p1.instrument < p2.instrument) return -1;
  if (p1.instrument > p2.instrument) return 1;
  else {
    if (p1.custodian < p2.custodian) return -1; 
    if (p1.custodian > p2.custodian) return 1;
    else return 0;
  }
}

const Holdings : React.FC<HoldingsProps> = ({ }) => {
  const party = useParty();
  const { getName } = useParties();
  const { loading: l1, holdings } = useHoldings();
  const classes = useStyles();
  if (l1) return <Spinner />;

  const filtered = holdings.filter(c => c.payload.account.owner === party && c.payload.instrument.id.unpack.match("-COMMITMENT") );
  const liabilities = holdings.filter(c => c.payload.account.custodian === party);

  var entries : PositionEntry[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const a = filtered[i];
    const entry = entries.find(e => e.custodian === a.payload.account.custodian && e.owner === a.payload.account.owner && e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    const isLocked = !!a.payload.lock;
    if (!!entry) {
      entry.position += qty;
      entry.locked += isLocked ? qty : 0;
      entry.available += isLocked ? 0 : qty;
    } else {
      entries.push({
        custodian: a.payload.account.custodian,
        owner: a.payload.account.owner,
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        position: qty,
        locked: isLocked ? qty : 0,
        available: isLocked ? 0 : qty, 
        commitment: 0
      });
    }
  }

  for (let i = 0; i < liabilities.length; i++) {
    const l = liabilities[i];
    const entry = entries.find(e => e.custodian === l.payload.account.owner && e.owner === l.payload.account.custodian && l.payload.instrument.id.unpack === e.instrument.split("-")[0])
    const qty = parseFloat(l.payload.amount) 
    if (!!entry) {
      entry.commitment += qty
    }
  }

  entries.sort(positionEntryCmp)

  const createRow = (e : PositionEntry) : any[] => {
    return [
      getName(e.custodian),
      getName(e.owner),
      e.instrument,
      e.version,
      fmt(e.commitment),
      fmt(e.position, 0),
      fmt(e.locked, 0),
      fmt(e.available, 0),
      <TextField 
        required 
        type="number" 
        label={"Amount"} onChange={e => {}}
        disabled={!e.instrument.match("PE1-COMMITMENT")}
      />,
      <Button color="primary" variant="contained"  onClick={() => {}} disabled={!e.instrument.match("PE1-COMMITMENT")}>Call</Button>
    ];
  }
  const headers = ["Obligor", "Beneficiary", "Instrument", "Version", "Initial", "Total Remaining", "Locked Remaining", "Available Remaining", "Capital"]
  const values : any[] = entries.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "right", "right", "right", "left"];
  return (
    <HorizontalTable title={ "Commitments"} variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};

export const PrivateEquity : React.FC = () => {
  return <Holdings />;
};
