// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { New } from "../pages/listing/New";
import { Requests } from "../pages/listing/Requests";
import { Listings } from "../pages/listing/Listings";
import { App } from "./App";

export const Listing : React.FC = () => {
  const entries : RouteEntry[] =
    [ { label: "Listings", path: "listings", element: <Listings />, icon: <PlayArrow/>, children: [] }
    , { label: "Requests", path: "requests", element: <Requests />, icon: <PlayArrow/>, children: [] }
    , { label: "New", path: "new", element: <New />, icon: <PlayArrow/>, children: [] } ];
  return <App title="Listing Portal" entries={entries} />;
}
