// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { Effects } from "../pages/servicing/Effects";
import { Effect } from "../pages/servicing/Effect";
import { Settlement } from "../pages/servicing/Settlement";
import { MarketData } from "../pages/servicing/MarketData";
import { App } from "./App";
import { Instruments } from "../pages/servicing/Instruments";
import { Instrument } from "../pages/servicing/Instrument";

export const Servicing : React.FC = () => {

  const entries : RouteEntry[] = [];
  entries.push({ label: "Instruments", path: "instruments", element: <Instruments />, icon: <PlayArrow/>, children: [] });
  entries.push({ label: "Effects", path: "effects", element: <Effects />, icon: <PlayArrow/>, children: [] });
  entries.push({ label: "Settlement", path: "settlement", element: <Settlement />, icon: <PlayArrow/>, children: [] });
  entries.push({ label: "Market Data", path: "marketdata", element: <MarketData />, icon: <PlayArrow/>, children: [] });
  entries.push({ path: "instruments/:contractId", element: <Instrument />, icon: <PlayArrow/>, children: [] });
  entries.push({ path: "effects/:contractId", element: <Effect />, icon: <PlayArrow/>, children: [] });

  return <App title="Lifecycle Management" entries={entries} />;
}
