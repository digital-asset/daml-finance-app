// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useQuery, useStreamQueries } from "@daml/react";
import { Instrument } from "@daml.js/daml-finance-interface-instrument-base/lib/Daml/Finance/Interface/Instrument/Base/Instrument";
import { Instrument as Base } from "@daml.js/daml-finance-instrument-base/lib/Daml/Finance/Instrument/Base/Instrument";
import { Instrument as Equity } from "@daml.js/daml-finance-instrument-equity/lib/Daml/Finance/Instrument/Equity/Instrument";
import { Instrument as Generic } from "@daml.js/daml-finance-instrument-generic/lib/Daml/Finance/Instrument/Generic/Instrument";
import { Instrument as FixedRateBond } from "@daml.js/daml-finance-instrument-bond/lib/Daml/Finance/Instrument/Bond/FixedRate";
import { Instrument as FloatingRateBond } from "@daml.js/daml-finance-instrument-bond/lib/Daml/Finance/Instrument/Bond/FloatingRate";
import { Instrument as InflationLinkedBond } from "@daml.js/daml-finance-instrument-bond/lib/Daml/Finance/Instrument/Bond/InflationLinked";
import { Instrument as ZeroCouponBond } from "@daml.js/daml-finance-instrument-bond/lib/Daml/Finance/Instrument/Bond/ZeroCoupon";
import { Lifecycle } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Lifecycle";
import { HasClaims } from "@daml.js/daml-finance-interface-instrument-generic/lib/Daml/Finance/Interface/Instrument/Generic/HasClaims";
import { Id, InstrumentKey } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Common";
import { key } from "../util";

type InstrumentsState = {
  loading : boolean
  groups : InstrumentGroup[]
  latests : InstrumentAggregate[]
  tokens : InstrumentAggregate[]
  getByCid : (cid : string) => InstrumentAggregate
};

export type InstrumentAggregate = CreateEvent<Instrument> & {
  key : InstrumentKey
  lifecycle : CreateEvent<Lifecycle> | undefined
  claims : CreateEvent<HasClaims> | undefined
}

type InstrumentGroup = {
  key : string
  depository : string
  issuer : string
  id : Id
  description : string
  versions : InstrumentAggregate[]
  latest : InstrumentAggregate
};

const empty = {
  loading: true,
  groups: [],
  latests: [],
  tokens: [],
  getByCid: (cid : string) => { throw new Error("Not implemented"); },
};

const InstrumentsContext = React.createContext<InstrumentsState>(empty);

export const InstrumentsProvider : React.FC = ({ children }) => {

  useQuery(Base);
  useQuery(Equity);
  useQuery(Generic);
  useQuery(FixedRateBond);
  useQuery(FloatingRateBond);
  useQuery(InflationLinkedBond);
  useQuery(ZeroCouponBond);

  const { contracts: instruments, loading: l1 } = useStreamQueries(Instrument);
  const { contracts: hasLifecycle, loading: l2 } = useStreamQueries(Lifecycle);
  const { contracts: hasClaims, loading: l3 } = useStreamQueries(HasClaims);

  const loading = l1 || l2 || l3;

  if (loading) {
    return (
      <InstrumentsContext.Provider value={empty}>
          {children}
      </InstrumentsContext.Provider>
    );
  } else {
    const aggregatesByCid : Map<string, InstrumentAggregate> = new Map();
    const lifecycleByCid : Map<string, CreateEvent<Lifecycle>> = new Map(hasLifecycle.map(c => [c.contractId, c]));
    const hasClaimsByCid : Map<string, CreateEvent<HasClaims>> = new Map(hasClaims.map(c => [c.contractId, c]));
    const groupMap : Map<string, InstrumentGroup> = new Map();
    instruments.forEach(c => {
      const aggregate = { ...c, key: key(c), lifecycle: lifecycleByCid.get(c.contractId), claims: hasClaimsByCid.get(c.contractId) };
      const groupKey = c.payload.id.unpack;
      const group = groupMap.get(groupKey) || { key: groupKey, depository: c.payload.depository, issuer: c.payload.issuer, id: c.payload.id, description: c.payload.description, versions: [], latest: aggregate };
      group.versions.push(aggregate);
      if (aggregate.payload.validAsOf >= group.latest.payload.validAsOf) group.latest = aggregate;
      groupMap.set(groupKey, group);
      aggregatesByCid.set(c.contractId, aggregate);
    });

    const getByCid = (cid : string) : InstrumentAggregate => {
      if (aggregatesByCid.has(cid)) return aggregatesByCid.get(cid)!;
      else throw new Error("Couldn't find instrument " + cid);
    };

    // TODO: This comes closes to being able to select base instruments (ie. tokens).
    const groups = Array.from(groupMap.values())
    const latests = groups.map(g => g.latest);
    const tokens = latests.filter(a => !a.claims && !a.lifecycle);
    const value = {
      loading,
      groups,
      latests,
      tokens,
      getByCid,
    };

    return (
      <InstrumentsContext.Provider value={value}>
          {children}
      </InstrumentsContext.Provider>
    );
  }
};

export const useInstruments = () => {
  return React.useContext(InstrumentsContext);
}
