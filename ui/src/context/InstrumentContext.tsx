// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useStreamQueries } from "@daml/react";
import { Instrument as Base } from "@daml.js/daml-finance-interface-instrument-base/lib/Daml/Finance/Interface/Instrument/Base/Instrument";
import { Instrument as FixedRateBond } from "@daml.js/daml-finance-interface-instrument-bond/lib/Daml/Finance/Interface/Instrument/Bond/FixedRate/Instrument";
import { Instrument as FloatingRateBond } from "@daml.js/daml-finance-interface-instrument-bond/lib/Daml/Finance/Interface/Instrument/Bond/FloatingRate/Instrument";
import { Instrument as InflationLinkedBond } from "@daml.js/daml-finance-interface-instrument-bond/lib/Daml/Finance/Interface/Instrument/Bond/InflationLinked/Instrument";
import { Instrument as ZeroCouponBond } from "@daml.js/daml-finance-interface-instrument-bond/lib/Daml/Finance/Interface/Instrument/Bond/ZeroCoupon/Instrument";
import { Instrument as Equity } from "@daml.js/daml-finance-interface-instrument-equity/lib/Daml/Finance/Interface/Instrument/Equity/Instrument";
import { Instrument as Generic } from "@daml.js/daml-finance-interface-instrument-generic/lib/Daml/Finance/Interface/Instrument/Generic/Instrument";
import { Instrument as CreditDefaultSwap } from "@daml.js/daml-finance-interface-instrument-swap/lib/Daml/Finance/Interface/Instrument/Swap/CreditDefault/Instrument";
import { Instrument as CurrencySwap } from "@daml.js/daml-finance-interface-instrument-swap/lib/Daml/Finance/Interface/Instrument/Swap/Currency/Instrument";
import { Instrument as ForeignExchangeSwap } from "@daml.js/daml-finance-interface-instrument-swap/lib/Daml/Finance/Interface/Instrument/Swap/ForeignExchange/Instrument";
import { Instrument as InterestRateSwap } from "@daml.js/daml-finance-interface-instrument-swap/lib/Daml/Finance/Interface/Instrument/Swap/InterestRate/Instrument";
import { Instrument as AssetSwap } from "@daml.js/daml-finance-interface-instrument-swap/lib/Daml/Finance/Interface/Instrument/Swap/Asset/Instrument";
import { Instrument as Token } from "@daml.js/daml-finance-interface-instrument-token/lib/Daml/Finance/Interface/Instrument/Token/Instrument";
import { Lifecycle } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Lifecycle";
import { Claim } from "@daml.js/daml-finance-interface-claims/lib/Daml/Finance/Interface/Claims/Claim";
import { Id, InstrumentKey } from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";
import { key } from "../util";
import { Disclosure } from "@daml.js/daml-finance-interface-util/lib/Daml/Finance/Interface/Util/Disclosure";

type InstrumentState = {
  loading               : boolean
  groups                : InstrumentGroup[]
  latests               : InstrumentAggregate[]
  tokens                : InstrumentAggregate[]
  equities              : InstrumentAggregate[]
  generics              : InstrumentAggregate[]
  fixedRateBonds        : InstrumentAggregate[]
  floatingRateBonds     : InstrumentAggregate[]
  inflationLinkedBonds  : InstrumentAggregate[]
  zeroCouponBonds       : InstrumentAggregate[]
  creditDefaultSwaps    : InstrumentAggregate[]
  currencySwaps         : InstrumentAggregate[]
  foreignExchangeSwaps  : InstrumentAggregate[]
  interestRateSwaps     : InstrumentAggregate[]
  assetSwaps            : InstrumentAggregate[]
  getByCid              : (cid : string) => InstrumentAggregate
};

export type InstrumentAggregate = CreateEvent<Base> & {
  key                 : InstrumentKey
  lifecycle           : CreateEvent<Lifecycle> | undefined
  claim               : CreateEvent<Claim> | undefined
  token               : CreateEvent<Token> | undefined
  equity              : CreateEvent<Equity> | undefined
  generic             : CreateEvent<Generic> | undefined
  fixedRateBond       : CreateEvent<FixedRateBond> | undefined
  floatingRateBond    : CreateEvent<FloatingRateBond> | undefined
  inflationLinkedBond : CreateEvent<InflationLinkedBond> | undefined
  zeroCouponBond      : CreateEvent<ZeroCouponBond> | undefined
  creditDefaultSwap   : CreateEvent<CreditDefaultSwap> | undefined
  currencySwap        : CreateEvent<CurrencySwap> | undefined
  foreignExchangeSwap : CreateEvent<ForeignExchangeSwap> | undefined
  interestRateSwap    : CreateEvent<InterestRateSwap> | undefined
  assetSwap           : CreateEvent<AssetSwap> | undefined
  disclosure          : CreateEvent<Disclosure> | undefined
}

export type InstrumentGroup = {
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
  equities: [],
  generics: [],
  fixedRateBonds: [],
  floatingRateBonds: [],
  inflationLinkedBonds: [],
  zeroCouponBonds: [],
  creditDefaultSwaps: [],
  currencySwaps: [],
  foreignExchangeSwaps: [],
  interestRateSwaps: [],
  assetSwaps: [],
  getByCid: (cid : string) => { throw new Error("Not implemented"); },
};

const InstrumentContext = React.createContext<InstrumentState>(empty);

export const InstrumentProvider : React.FC = ({ children }) => {

  const { loading: l1,  contracts: instruments }          = useStreamQueries(Base);
  const { loading: l2,  contracts: lifecycles }           = useStreamQueries(Lifecycle);
  const { loading: l3,  contracts: claims }               = useStreamQueries(Claim);
  const { loading: l4,  contracts: tokens }               = useStreamQueries(Token);
  const { loading: l5,  contracts: equities }             = useStreamQueries(Equity);
  const { loading: l6,  contracts: generics }             = useStreamQueries(Generic);
  const { loading: l7,  contracts: fixedRateBonds }       = useStreamQueries(FixedRateBond);
  const { loading: l8,  contracts: floatingRateBonds }    = useStreamQueries(FloatingRateBond);
  const { loading: l9,  contracts: inflationLinkedBonds } = useStreamQueries(InflationLinkedBond);
  const { loading: l10,  contracts: zeroCouponBonds }      = useStreamQueries(ZeroCouponBond);
  const { loading: l11, contracts: creditDefaultSwaps }   = useStreamQueries(CreditDefaultSwap);
  const { loading: l12, contracts: currencySwaps }        = useStreamQueries(CurrencySwap);
  const { loading: l13, contracts: foreignExchangeSwaps } = useStreamQueries(ForeignExchangeSwap);
  const { loading: l14, contracts: interestRateSwaps }    = useStreamQueries(InterestRateSwap);
  const { loading: l15, contracts: assetSwaps }           = useStreamQueries(AssetSwap);
  const { loading: l16, contracts: disclosures }          = useStreamQueries(Disclosure);
  const loading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11 || l12 || l13 || l14 || l15 || l16;

  if (loading) {
    return (
      <InstrumentContext.Provider value={empty}>
          {children}
      </InstrumentContext.Provider>
    );
  } else {
    const aggregatesByCid           : Map<string, InstrumentAggregate>              = new Map();
    const lifecycleByCid            : Map<string, CreateEvent<Lifecycle>>           = new Map(lifecycles.map(c => [c.contractId, c]));
    const claimsByCid               : Map<string, CreateEvent<Claim>>               = new Map(claims.map(c => [c.contractId, c]));
    const tokensByCid               : Map<string, CreateEvent<Token>>               = new Map(tokens.map(c => [c.contractId, c]));
    const equitiesByCid             : Map<string, CreateEvent<Equity>>              = new Map(equities.map(c => [c.contractId, c]));
    const genericsByCid             : Map<string, CreateEvent<Generic>>             = new Map(generics.map(c => [c.contractId, c]));
    const fixedRateBondsByCid       : Map<string, CreateEvent<FixedRateBond>>       = new Map(fixedRateBonds.map(c => [c.contractId, c]));
    const floatingRateBondsByCid    : Map<string, CreateEvent<FloatingRateBond>>    = new Map(floatingRateBonds.map(c => [c.contractId, c]));
    const inflationLinkedBondsByCid : Map<string, CreateEvent<InflationLinkedBond>> = new Map(inflationLinkedBonds.map(c => [c.contractId, c]));
    const zeroCouponBondsByCid      : Map<string, CreateEvent<ZeroCouponBond>>      = new Map(zeroCouponBonds.map(c => [c.contractId, c]));
    const creditDefaultSwapsByCid   : Map<string, CreateEvent<CreditDefaultSwap>>   = new Map(creditDefaultSwaps.map(c => [c.contractId, c]));
    const currencySwapsByCid        : Map<string, CreateEvent<CurrencySwap>>        = new Map(currencySwaps.map(c => [c.contractId, c]));
    const foreignExchangeSwapsByCid : Map<string, CreateEvent<ForeignExchangeSwap>> = new Map(foreignExchangeSwaps.map(c => [c.contractId, c]));
    const interestRateSwapsByCid    : Map<string, CreateEvent<InterestRateSwap>>    = new Map(interestRateSwaps.map(c => [c.contractId, c]));
    const assetSwapsByCid           : Map<string, CreateEvent<AssetSwap>>           = new Map(assetSwaps.map(c => [c.contractId, c]));
    const disclosuresByCid          : Map<string, CreateEvent<Disclosure>>          = new Map(disclosures.map(c => [c.contractId, c]));
    const groupMap : Map<string, InstrumentGroup> = new Map();
    instruments.forEach(c => {
      const aggregate : InstrumentAggregate = {
        ...c,
        key: key(c),
        lifecycle: lifecycleByCid.get(c.contractId),
        claim: claimsByCid.get(c.contractId),
        token: tokensByCid.get(c.contractId),
        equity: equitiesByCid.get(c.contractId),
        generic: genericsByCid.get(c.contractId),
        fixedRateBond: fixedRateBondsByCid.get(c.contractId),
        floatingRateBond: floatingRateBondsByCid.get(c.contractId),
        inflationLinkedBond: inflationLinkedBondsByCid.get(c.contractId),
        zeroCouponBond: zeroCouponBondsByCid.get(c.contractId),
        creditDefaultSwap: creditDefaultSwapsByCid.get(c.contractId),
        currencySwap: currencySwapsByCid.get(c.contractId),
        foreignExchangeSwap: foreignExchangeSwapsByCid.get(c.contractId),
        interestRateSwap: interestRateSwapsByCid.get(c.contractId),
        assetSwap: assetSwapsByCid.get(c.contractId),
        disclosure: disclosuresByCid.get(c.contractId)
      };
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
    const value = {
      loading,
      groups,
      latests,
      tokens: latests.filter(a => !!a.token),
      equities: latests.filter(a => !!a.equity),
      generics: latests.filter(a => !!a.generic),
      fixedRateBonds: latests.filter(a => !!a.fixedRateBond),
      floatingRateBonds: latests.filter(a => !!a.floatingRateBond),
      inflationLinkedBonds: latests.filter(a => !!a.inflationLinkedBond),
      zeroCouponBonds: latests.filter(a => !!a.zeroCouponBond),
      creditDefaultSwaps: latests.filter(a => !!a.creditDefaultSwap),
      currencySwaps: latests.filter(a => !!a.currencySwap),
      foreignExchangeSwaps: latests.filter(a => !!a.foreignExchangeSwap),
      interestRateSwaps: latests.filter(a => !!a.interestRateSwap),
      assetSwaps: latests.filter(a => !!a.assetSwap),
      getByCid,
    };

    return (
      <InstrumentContext.Provider value={value}>
          {children}
      </InstrumentContext.Provider>
    );
  }
};

export const useInstruments = () => {
  return React.useContext(InstrumentContext);
}
