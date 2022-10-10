// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { Market } from "../pages/trading/Market";
import { Markets } from "../pages/trading/Markets";
import { useStreamQueries } from "@daml/react";
import { Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { App } from "./App";
import { Spinner } from "../components/Spinner/Spinner";

export const Trading : React.FC = () => {
  const { contracts: listings, loading: l1 } = useStreamQueries(Listing);
  if (l1) return <Spinner />;
  const listingEntries = listings.map(c => ({ label: c.payload.id, path: "markets/" + c.contractId, element: <Market /> }));
  const entries = [ { label: "Markets", path: "markets", element: <Markets /> } ];//.concat(listingEntries);
  const paths = [ { path: "markets/:contractId", element: <Market /> } ];
  return <App app="Trading" entries={entries} paths={paths} />;
}
