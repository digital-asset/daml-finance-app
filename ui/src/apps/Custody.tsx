// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { Accounts } from "../pages/custody/Accounts";
import { App } from "./App";
import { Assets } from "../pages/custody/Assets";
import { Liabilities } from "../pages/custody/Liabilities";
import { Balance } from "../pages/custody/Balance";

export const Custody : React.FC = () => {
  const entries : RouteEntry[] =
    [ { path: "assets"     , element: <Assets />     , label: "Assets"     , icon: <PlayArrow/> }
    , { path: "liabilities", element: <Liabilities />, label: "Liabilities", icon: <PlayArrow/> }
    , { path: "balance"    , element: <Balance />    , label: "Balance"    , icon: <PlayArrow/> }
    , { path: "accounts"   , element: <Accounts />   , label: "Accounts"   , icon: <PlayArrow/> } ]
  return <App title="Custody Portal" entries={entries} />;
}
