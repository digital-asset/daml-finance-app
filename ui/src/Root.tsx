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

export const Root : React.FC = () => {

  return (
    <ServicesProvider>
      <InstrumentProvider>
        <HoldingProvider>
          <AccountProvider>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/structuring/*" element={<Structuring />} />
              <Route path="/issuance/*" element={<Issuance />} />
              <Route path="/lending/*" element={<Lending />} />
              <Route path="/custody/*" element={<Custody />} />
              <Route path="/distribution/*" element={<Distribution />} />
              <Route path="/servicing/*" element={<Servicing />} />
              <Route path="/settlement/*" element={<Settlement />} />
              <Route path="/simulation/*" element={<Simulation />} />
              <Route path="/listing/*" element={<Listing />} />
              <Route path="/trading/*" element={<Trading />} />
              <Route path="/network/*" element={<Network />} />
            </Routes>
          </AccountProvider>
        </HoldingProvider>
      </InstrumentProvider>
    </ServicesProvider>
  );
}
