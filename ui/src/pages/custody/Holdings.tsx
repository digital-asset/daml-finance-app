// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty } from "@daml/react";
import { fmt, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useHoldings } from "../../context/HoldingContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";

export type HoldingsProps = {
  showAssets : boolean
}

type PositionEntry = {
  custodian : string
  owner : string
  instrument : string
  version : string
  position : number
  locked : number
  available : number
}

export const Holdings : React.FC<HoldingsProps> = ({ showAssets }) => {
  const party = useParty();
  const { getName } = useParties();
  const { loading: l1, holdings } = useHoldings();
  if (l1) return <Spinner />;

  const filtered = holdings.filter(c => showAssets ? c.payload.account.owner === party : c.payload.account.custodian === party);

  const entries : PositionEntry[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const a = filtered[i];
    const entry = entries.find(e => e.custodian === a.payload.account.custodian && e.owner === a.payload.account.owner && e.instrument === a.payload.instrument.id.unpack && e.version === shorten(a.payload.instrument.version));
    const qty = parseFloat(a.payload.amount);
    const isLocked = !!a.lockable && !!a.lockable.payload.lock;
    if (!!entry) {
      entry.position += qty;
      entry.locked += isLocked ? qty : 0;
      entry.available += isLocked ? 0 : qty;
    } else {
      entries.push({
        custodian: a.payload.account.custodian,
        owner: a.payload.account.owner,
        instrument: a.payload.instrument.id.unpack,
        version: shorten(a.payload.instrument.version),
        position: qty,
        locked: isLocked ? qty : 0,
        available: isLocked ? 0 : qty
      });
    }
  }

  const createRow = (e : PositionEntry) : any[] => {
    return [
      getName(e.custodian),
      getName(e.owner),
      e.instrument,
      e.version,
      fmt(e.position, 0),
      fmt(e.locked, 0),
      fmt(e.available, 0)
    ];
  }
  const headers = ["Custodian", "Owner", "Instrument", "Version", "Position", "Locked", "Available"]
  const values : any[] = entries.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "right", "right"];
  return (
    <HorizontalTable title={showAssets ? "Assets" : "Liabilities"} variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
