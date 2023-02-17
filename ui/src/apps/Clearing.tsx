// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Request } from "../pages/clearing/Request";
import { Requests } from "../pages/clearing/Requests";
import { Trades } from "../pages/clearing/Trades";
import { App } from "./App";

export const Clearing : React.FC = () => {
  const entries =
    [ { label: "Trades", path: "trades", element: <Trades /> }
    , { label: "Requests", path: "requests", element: <Requests /> } ];

  const paths =
    [ { path: "requests/:contractId", element: <Request /> } ];
  return <App app="Clearing" entries={entries} paths={paths} />;
}
