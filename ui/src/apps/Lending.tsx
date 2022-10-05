// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { App } from "./App";
import { New } from "../pages/lending/New";
import { Requests } from "../pages/lending/Requests";
import { Trades } from "../pages/lending/Trades";
import { Offers } from "../pages/lending/Offers";
import { Request } from "../pages/lending/Request";

export const Lending : React.FC = () => {
  const entries = [
    { label: "Trades", path: "trades", element: <Trades /> },
    { label: "Offers", path: "offers", element: <Offers /> },
    { label: "Requests", path: "requests", element: <Requests /> },
    { label: "New", path: "new", element: <New /> }
  ];
  const paths = [
    { path: "requests/request/:contractId", element: <Request /> }
  ];

  return <App app="Lending" entries={entries} paths={paths} />;
}
