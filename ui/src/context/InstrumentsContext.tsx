// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useStreamQueries } from "@daml/react";
import { Instrument as Token } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Instrument";
import { Instrument as Derivative } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";
import { FixedRateBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/FixedRate";
import { FloatingRateBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/FloatingRate";
import { InflationLinkedBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/InflationLinked";
import { ZeroCouponBond } from "@daml.js/daml-finance-bond/lib/Daml/Finance/Bond/ZeroCoupon";

export type InstrumentsState = {
  loading : boolean
  tokens : readonly CreateEvent<Token>[]
  derivatives : readonly CreateEvent<Derivative>[]
  fixedRateBonds : readonly CreateEvent<FixedRateBond>[]
  floatingRateBonds : readonly CreateEvent<FloatingRateBond>[]
  inflationLinkedBonds : readonly CreateEvent<InflationLinkedBond>[]
  zeroCouponBonds : readonly CreateEvent<ZeroCouponBond>[]
};

const empty = {
  loading: true,
  tokens: [],
  derivatives: [],
  fixedRateBonds: [],
  floatingRateBonds: [],
  inflationLinkedBonds: [],
  zeroCouponBonds: [],
};

const InstrumentsContext = React.createContext<InstrumentsState>(empty);

export const InstrumentsProvider : React.FC = ({ children }) => {

  const { contracts: tokens, loading: l1 } = useStreamQueries(Token);
  const { contracts: derivatives, loading: l2 } = useStreamQueries(Derivative);
  const { contracts: fixedRateBonds, loading: l3 } = useStreamQueries(FixedRateBond);
  const { contracts: floatingRateBonds, loading: l4 } = useStreamQueries(FloatingRateBond);
  const { contracts: inflationLinkedBonds, loading: l5 } = useStreamQueries(InflationLinkedBond);
  const { contracts: zeroCouponBonds, loading: l6 } = useStreamQueries(ZeroCouponBond);
  const loading = l1 || l2 || l3 || l4 || l5 || l6;

  const value = {
    loading,
    tokens,
    derivatives,
    fixedRateBonds,
    floatingRateBonds,
    inflationLinkedBonds,
    zeroCouponBonds,
  };

  return (
    <InstrumentsContext.Provider value={value}>
        {children}
    </InstrumentsContext.Provider>
  );
};

export const useInstruments = () => {
  return React.useContext(InstrumentsContext);
}
