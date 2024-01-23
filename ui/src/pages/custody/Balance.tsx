// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty } from "@daml/react";
import { fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useHoldings } from "../../context/HoldingContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";

type BalanceEntry = {
  // providers : string[]
  // owners : string[]
  instrument : string
  version : string
  assets : number
  liabilities : number
  net : number
}

export const Balance : React.FC = () => {
  const party = useParty();

  const { loading: l1, holdings } = useHoldings();
  if (l1) return <Spinner />;

  const assetsAndLiabilities = holdings.filter(c => c.payload.account.custodian === party || c.payload.account.owner === party);
  const assets = assetsAndLiabilities.filter(c => c.payload.account.owner === party);
  const liabilities = assetsAndLiabilities.filter(c => c.payload.account.custodian === party);

  const entries : BalanceEntry[] = [];
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const entry = entries.find(e => e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    if (!!entry) {
      entry.assets += qty;
      entry.net += qty;
    } else {
      entries.push({
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        assets: qty,
        liabilities: 0,
        net: qty
      });
    }
  }
  for (let i = 0; i < liabilities.length; i++) {
    const a = liabilities[i];
    const entry = entries.find(e => e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    if (!!entry) {
      entry.liabilities += qty;
      entry.net -= qty;
    } else {
      entries.push({
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        assets: 0,
        liabilities: qty,
        net: -qty
      });
    }
  }

  const createRow = (e : BalanceEntry) : any[] => {
    return [
      e.instrument,
      e.version,
      fmt(e.assets, 0),
      fmt(e.liabilities, 0),
      fmt(e.net, 0)
    ];
  }
  const headers = ["Instrument", "Version", "Assets", "Liabilities", "Net"]
  const values : any[] = entries.map(createRow);
  const alignment : Alignment[] = ["left", "left", "right", "right", "right"];
  return (
    <HorizontalTable title="Balance" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
