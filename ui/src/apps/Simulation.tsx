// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { Scenario } from "../pages/simulation/Scenario";
import { App } from "./App";

export const Simulation : React.FC = () => {
  const entries : RouteEntry[] =
    [ { label: "Scenario", path: "scenario", element: <Scenario />, icon: <PlayArrow/>, children: [] } ]
  return <App title="Simulation Portal" entries={entries} />;
}
