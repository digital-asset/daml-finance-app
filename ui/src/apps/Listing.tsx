// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { New } from "../pages/listing/New";
import { Requests } from "../pages/listing/Requests";
import { Listings } from "../pages/listing/Listings";
import { App } from "./App";

export const Listing : React.FC = () => {
  const entries =
    [ { label: "Listings", path: "listings", element: <Listings /> }
    , { label: "Requests", path: "requests", element: <Requests /> }
    , { label: "New Listing", path: "new", element: <New />, action: true } ];
  return <App app="Listing" entries={entries} paths={[]} />;
}
