// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Effects } from "../pages/servicing/Effects";
import { Effect } from "../pages/servicing/Effect";
import { App } from "./App";
import { Instruments } from "../pages/servicing/Instruments";
import { Instrument } from "../pages/servicing/Instrument";
import { Batch } from "../pages/settlement/Batch";

export const Servicing : React.FC = () => {
  const entries = [
    { label: "Trades", path: "trades", element: <Instruments /> },
    { label: "Obligations", path: "obligations", element: <Effects /> },
    { label: "Settlement", path: "settlement", element: <Batch /> },
  ];
  const paths = [
    { path: "trades/:contractId", element: <Instrument /> },
    { path: "obligations/:contractId", element: <Effect /> }
  ];
  return <App app="Settlement Orchestration" entries={entries} paths={paths} />;
}
