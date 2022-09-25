// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { App } from "./App";
import { Batches } from "../pages/settlement/Batches";
import { Batch } from "../pages/settlement/Batch";

export const Settlement : React.FC = () => {
  const entries : RouteEntry[] =
    [ { path: "batches", element: <Batches />, label: "Batches", icon: <PlayArrow/> }
    , { path: "batches/:contractId", element: <Batch /> } ];
  return <App title="Settlement" entries={entries} />;
}
