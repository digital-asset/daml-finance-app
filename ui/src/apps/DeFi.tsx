// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { App } from "./App";
import { Exchanges } from "../pages/defi/Exchanges";
import { Exchange } from "../pages/defi/Exchange";

export const DeFi : React.FC = () => {
  const entries =
    [ { path: "exchanges", element: <Exchanges />, label: "Exchanges" } ];
    // , { path: "lending",  element: <Lending />, label: "Lending" } ]
  const paths = [
    { path: "exchanges/:dexId", element: <Exchange /> }
  ];

  return <App app="DeFi" entries={entries} paths={paths} />;
}
