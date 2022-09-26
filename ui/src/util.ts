// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Set } from "@daml.js/97b883cd8a2b7f49f90d5d39c981cf6e110cf1f1c64427a28a6d58ec88c43657/lib/DA/Set/Types"
import { Instrument } from "@daml.js/daml-finance-interface-instrument-base/lib/Daml/Finance/Interface/Instrument/Base/Instrument";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Common";
import { CreateEvent } from "@daml/ledger";
import { emptyMap } from "@daml/types";

export function values<T>(set: Set<T>): T[] {
  return set.map.entriesArray().map(v => v[0]);
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
  return k1.depository === k2.depository && k1.issuer === k2.issuer && k1.id.unpack === k2.id.unpack && k1.version === k2.version;
};

export const keyString = (k : InstrumentKey) : string => {
  return k.depository + "-" + k.issuer + "-" + k.id.unpack + "@" + k.version;
};

export const fmt = (x : number | string, decimals?: number) => {
  return (typeof x === "string" ? parseFloat(x) : x).toFixed(decimals || 0).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "'");
}

export const dedup = (array : string[]) : string[] => {
  return array.filter((v, i, a) => a.indexOf(v) === i);
};

export const key = (c : CreateEvent<Instrument>) : InstrumentKey => {
  return { depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id, version: c.payload.version };
};

export const shorten = (s : string) : string => {
  return s.substring(0, 8);
};

export function getTemplateId(t : string) {
  const parts = t.split(":").slice(1)
  return parts[0] + "." + parts[1];
}
