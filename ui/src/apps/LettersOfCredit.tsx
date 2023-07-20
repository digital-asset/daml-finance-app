// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { App } from "./App";
import { New } from "../pages/loc/New";
import { LoCs } from "../pages/loc/LoCs"
import { Requests } from "../pages/loc/Requests"
import { Request } from "../pages/loc/Request"
import { Offers } from "../pages/loc/Offers"

export const LettersOfCredit : React.FC = () => {
  const entries = [
    { label: "SBLCs",        path: "locs", element: <LoCs /> },
    { label: "Offers", path: "offers", element: <Offers />},
    { label: "Requests",     path: "requests", element: <Requests />},
    { label: "Request SBLC", path: "new", element: <New />},
  ];
  const paths = [
    { path: "requests/request/:contractId", element: <Request /> }
  ];


  return <App app="LettersOfCredit" entries={entries} paths={paths} />;
}
