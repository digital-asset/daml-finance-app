// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Effects } from "../pages/servicing/Effects";
import { Effect } from "../pages/servicing/Effect";
import { MarketData } from "../pages/servicing/MarketData";
import { App } from "./App";
import { Instruments } from "../pages/servicing/Instruments";
import { Instrument } from "../pages/servicing/Instrument";

export const Servicing : React.FC = () => {
  const entries = [
    { label: "Instruments", path: "instruments", element: <Instruments /> },
    { label: "Effects", path: "effects", element: <Effects /> },
    { label: "Market Data", path: "marketdata", element: <MarketData /> },
  ];
  const paths = [
    { path: "instruments/:contractId", element: <Instrument /> },
    { path: "effects/:contractId", element: <Effect /> }
  ];
  return <App app="Servicing" entries={entries} paths={paths} />;
}
