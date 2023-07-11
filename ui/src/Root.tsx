// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Servicing } from "./apps/Servicing";
import { Custody } from "./apps/Custody";
import { Issuance } from "./apps/Issuance";
import { Distribution } from "./apps/Distribution";
import { Listing } from "./apps/Listing";
import { Trading } from "./apps/Trading";
import { Structuring } from "./apps/Structuring";
import { Simulation } from "./apps/Simulation";
import { Network } from "./apps/Network";
import { Lending } from "./apps/Lending";
import { Settlement } from "./apps/Settlement";
import { Route, Routes } from "react-router-dom";
import { Overview } from "./apps/Overview";
import { ServicesProvider } from "./context/ServiceContext";
import { InstrumentProvider } from "./context/InstrumentContext";
import { HoldingProvider } from "./context/HoldingContext";
import { AccountProvider } from "./context/AccountContext";
import { DeFi } from "./apps/DeFi";
import { Clearing } from "./apps/Clearing";
import { Quoting } from "./apps/Quoting";

export const Root : React.FC = () => {

  return (
    <ServicesProvider>
      <InstrumentProvider>
        <HoldingProvider>
          <AccountProvider>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/clearing/*" element={<Clearing />} />
              <Route path="/registry/*" element={<Custody />} />
              <Route path="/defi/*" element={<DeFi />} />
              <Route path="/distribution/*" element={<Distribution />} />
              <Route path="/issuance/*" element={<Issuance />} />
              <Route path="/lending/*" element={<Lending />} />
              <Route path="/listing/*" element={<Listing />} />
              <Route path="/network/*" element={<Network />} />
              <Route path="/quoting/*" element={<Quoting />} />
              <Route path="/orchestration/*" element={<Servicing />} />
              <Route path="/settlement/*" element={<Settlement />} />
              <Route path="/simulation/*" element={<Simulation />} />
              <Route path="/sourcing/*" element={<Structuring />} />
              <Route path="/trading/*" element={<Trading />} />
            </Routes>
          </AccountProvider>
        </HoldingProvider>
      </InstrumentProvider>
    </ServicesProvider>
  );
}
