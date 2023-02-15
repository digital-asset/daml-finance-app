// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Market } from "../pages/trading/Market";
import { Markets } from "../pages/trading/Markets";
import { NewQuote } from "../pages/trading/NewQuote";
import { Quotes } from "../pages/trading/Quotes";
import { Request } from "../pages/trading/Request";
import { Requests } from "../pages/trading/Requests";
import { App } from "./App";

export const Trading : React.FC = () => {
  const entries =
    [ { label: "Markets", path: "markets", element: <Markets /> }
  , { label: "Quotes", path: "quotes", element: <Quotes /> }
    , { label: "Requests", path: "requests", element: <Requests /> }
    , { label: "Request Quote", path: "new", element: <NewQuote />, action: true } ];

  const paths =
    [ { path: "requests/:contractId", element: <Request /> }
    , { path: "markets/:contractId", element: <Market /> } ];
  return <App app="Trading" entries={entries} paths={paths} />;
}
