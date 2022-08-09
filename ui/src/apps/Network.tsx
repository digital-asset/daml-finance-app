// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { App } from "./App";
import { Overview } from "../pages/network/Overview";

export const Network : React.FC = () => {
  const entries : RouteEntry[] =
  [ { label: "Overview", path: "overview", element: <Overview />, icon: <PlayArrow/>, children: [] } ]
  return <App title="Network Portal" entries={entries} />;
}
