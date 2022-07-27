// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { New } from "../pages/issuance/New";
import { Requests } from "../pages/issuance/Requests";
import { Issuances } from "../pages/issuance/Issuances";
import { App } from "./App";

export const Issuance : React.FC = () => {
  const entries : RouteEntry[] =
    [ { label: "Issuances", path: "issuances", element: <Issuances />, icon: <PlayArrow/>, children: [] }
    , { label: "Requests", path: "requests", element: <Requests />, icon: <PlayArrow/>, children: [] }
    , { label: "New", path: "new", element: <New />, icon: <PlayArrow/>, children: [] } ];
  return <App title="Issuance Portal" entries={entries} />;
}
