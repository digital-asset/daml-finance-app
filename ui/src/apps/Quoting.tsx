// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { NewQuote } from "../pages/quoting/NewQuote";
import { Quotes } from "../pages/quoting/Quotes";
import { Request } from "../pages/quoting/Request";
import { Requests } from "../pages/quoting/Requests";
import { App } from "./App";

export const Quoting : React.FC = () => {
  const entries =
    [ { label: "Quotes", path: "quotes", element: <Quotes /> }
    , { label: "Requests", path: "requests", element: <Requests /> }
    , { label: "Request Quote", path: "new", element: <NewQuote />, action: true } ];

  const paths =
    [ { path: "requests/:contractId", element: <Request /> } ];
  return <App app="Quoting" entries={entries} paths={paths} />;
}
