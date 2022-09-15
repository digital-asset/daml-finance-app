// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { App } from "./App";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { New } from "../pages/lending/New";
import { Requests } from "../pages/lending/Requests";
import { Trades } from "../pages/lending/Trades";
import { Offers } from "../pages/lending/Offers";
import { Request } from "../pages/lending/Request";

export const Lending : React.FC = () => {
  const entries : RouteEntry[] = [
    { label: "Trades", path: "trades", element: <Trades />, icon: <PlayArrow/>, children: [] },
    { label: "Offers", path: "offers", element: <Offers />, icon: <PlayArrow/>, children: [] },
    { label: "Requests", path: "requests", element: <Requests />, icon: <PlayArrow/>, children: [] },
    { label: "New", path: "new", element: <New />, icon: <PlayArrow/>, children: [] },
    { path: "requests/request/:contractId", element: <Request /> } ];
  return <App title="Issuance Portal" entries={entries} />;
}
