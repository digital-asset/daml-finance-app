// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { New } from "../pages/issuance/New";
import { Requests } from "../pages/issuance/Requests";
import { Issuances } from "../pages/issuance/Issuances";
import { Issuance as IssuanceDetail } from "../pages/issuance/Issuance";
import { App } from "./App";

export const Issuance : React.FC = () => {
  const entries : RouteEntry[] = [
    { path: "issuances", element: <Issuances />, label: "Issuances", icon: <PlayArrow/>, children: [] },
    { path: "requests", element: <Requests />, label: "Requests", icon: <PlayArrow/>, children: [] },
    { path: "new", element: <New />, label: "New", icon: <PlayArrow/>, children: [] },
    { path: "issuances/:contractId", element: <IssuanceDetail /> } ];
  return <App title="Issuance Portal" entries={entries} />;
}
