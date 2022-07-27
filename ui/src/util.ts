// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Set } from "@daml.js/97b883cd8a2b7f49f90d5d39c981cf6e110cf1f1c64427a28a6d58ec88c43657/lib/DA/Set/Types"
import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
import { Instrument as Base } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { InstrumentKey } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Types";
import { Id } from "@daml.js/daml-finance-interface-asset/lib/Daml/Finance/Interface/Asset/Types";
import Ledger, { CreateEvent } from "@daml/ledger";
import { ContractId, emptyMap } from "@daml/types";
import { partyIds, partyNames, partyTokens } from "./config";

export function values<T>(set: Set<T>): T[] {
  const r: T[] = [];
  const it = set.map.keys();
  let i = it.next();
  while (!i.done) {
    r.push(i.value);
    i = it.next();
  }
  return r;
};

export const setEquals = <T>(a : Set<T>, b : Set<T>) : boolean => {
  const av = values(a);
  const bv = values(b);
  return av.length === bv.length && av.every(v => bv.includes(v));
};

export const arraySetEquals = <T>(a : T[], b : Set<T>) : boolean => {
  const bv = values(b);
  return a.length === bv.length && a.every(v => b.map.has(v));
};

export const emptySet = <T>() : Set<T> => ({ map: emptyMap<T, {}>() });

export const createSet = <T>(values: T[]) : Set<T> => {
  var map = emptyMap<T, {}>();
  for (var i = 0; i < values.length; i++) map = map.set(values[i], {});
  return ({ map });
};

export const singleton = <T>(value: T) : Set<T> => {
  const map = emptyMap<T, {}>();
  return ({ map: map.set(value, {}) });
};

export const parseDate = (d : Date | null) => (!!d && d.toString() !== "Invalid Date" && new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)) || "";

export const keyEquals = (k1 : InstrumentKey, k2 : InstrumentKey) : boolean => {
  return setEquals(k1.depository, k2.depository) && setEquals(k1.issuer, k2.issuer) && k1.id.label === k2.id.label && k1.id.version === k2.id.version;
};

export const fmt = (x : number | string, decimals?: number) => {
  return (typeof x === "string" ? parseFloat(x) : x).toFixed(decimals || 0).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "'");
}

export const dedup = (array : string[]) : string[] => {
  return array.filter((v, i, a) => a.indexOf(v) === i);
};

export const createKeyDerivative = (c : CreateEvent<Derivative>) : InstrumentKey => {
  return { depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id };
};

export const createKeyBase = (c : CreateEvent<Base>) : InstrumentKey => {
  return { depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id };
};

export const parties = (set : Set<string>) : string => {
  return values(set).map(getName).join(", ");
};

export const version = (id : Id) : string => {
  return id.version.substring(0, 8) + "..";
};

export const id = (id : Id) : string => {
  return id.label + " (" + version(id) + ")";
};

export function getParty(name : string) : string {
  return (partyIds[name] || "") as string;
}

export function getName(party : string) : string {
  return (partyNames[party] || "") as string;
}

export function getToken(party : string) {
  return (partyTokens[party] || "") as string;
}

export function getTemplateId(t : string) {
  const parts = t.split(":").slice(1)
  return parts[0] + "." + parts[1];
}

export const getHolding = async (ledger : Ledger, holdings : CreateEvent<Holding>[], amount : number, instrument: InstrumentKey) : Promise<ContractId<Holding>> => {
  const filtered = holdings.filter(c => keyEquals(c.payload.instrument, instrument) && c.payload.locker.map.entriesArray().length === 0);
  const sum = filtered.reduce((a, b) => a + parseFloat(b.payload.amount), 0);
  if (filtered.length === 0 || sum < amount) throw new Error("Insufficient holdings (" + sum.toFixed(4) + ") found for: " + amount.toFixed(4) + " " + id(instrument.id));
  if (filtered.length === 1 && sum === amount) return filtered[0].contractId;
  if (filtered.length === 1 && sum > amount) {
    const [ { splitCids, }, ] = await ledger.exercise(Holding.Split, filtered[0].contractId, { amounts: [ amount.toString() ] });
    return splitCids[0];
  }
  const [h, ...t] = filtered;
  const [fungibleCid, ] = await ledger.exercise(Holding.Merge, h.contractId, { fungibleCids: t.map(c => c.contractId) });
  const mergedCid = fungibleCid as unknown as ContractId<Holding>;
  if (sum === amount) return mergedCid;

  const [ { splitCids, }, ] = await ledger.exercise(Holding.Split, mergedCid, { amounts: [ amount.toString() ] });
  return splitCids[0];
}
