// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Accounts } from "../pages/custody/Accounts";
import { App } from "./App";
import { Assets } from "../pages/custody/Assets";
import { Liabilities } from "../pages/custody/Liabilities";
import { Balance } from "../pages/custody/Balance";
import { PrivateEquity } from "../pages/custody/PrivateEquity";

export const Custody : React.FC = () => {
  const entries =
    [ { path: "assets"     , element: <Assets />     , label: "Assets"      }
    , { path: "liabilities", element: <Liabilities />, label: "Liabilities" }
    , { path: "balance"    , element: <Balance />    , label: "Balance"     }
    , { path: "accounts"   , element: <Accounts />   , label: "Accounts"    }
    , { path: "pe"         , element: <PrivateEquity />, label: "Portfolio "  } ]
  return <App app="Custody" entries={entries} paths={[]} />;
}
