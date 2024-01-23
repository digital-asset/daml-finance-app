// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { App } from "./App";
import { Batches } from "../pages/settlement/Batches";
import { Batch } from "../pages/settlement/Batch";

export const Settlement : React.FC = () => {
  const entries = [
    { path: "batches", element: <Batches />, label: "Batches", icon: <PlayArrow/> }
  ];
  const paths = [
    { path: "batches/:contractId", element: <Batch /> }
  ]
  return <App app="Settlement" entries={entries} paths={paths} />;
}
