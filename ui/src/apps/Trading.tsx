// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Market } from "../pages/trading/Market";
import { Markets } from "../pages/trading/Markets";
import { App } from "./App";

export const Trading : React.FC = () => {
  const entries =
    [ { label: "Markets", path: "markets", element: <Markets /> } ];

  const paths =
    [ { path: "markets/:contractId", element: <Market /> } ];
  return <App app="Trading" entries={entries} paths={paths} />;
}
