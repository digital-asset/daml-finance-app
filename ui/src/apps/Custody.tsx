// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Accounts } from "../pages/custody/Accounts";
import { App } from "./App";
import { Assets } from "../pages/custody/Assets";
import { Liabilities } from "../pages/custody/Liabilities";
import { Balance } from "../pages/custody/Balance";
import { NewFunding } from "../pages/custody/NewFunding";

export const Custody : React.FC = () => {
  const entries =
    [ { path: "nostro", element: <Assets />     , label: "Nostro"      }
    , { path: "vostro", element: <Liabilities />, label: "Vostro" }
    , { path: "balance", element: <Balance />    , label: "Balance"     }
    , { path: "accounts", element: <Accounts />   , label: "Accounts"    }
    , { path: "new/funding", element: <NewFunding />, label: "Fund Account", action: true } ];
  return <App app="Cash Registry" entries={entries} paths={[]} />;
}
