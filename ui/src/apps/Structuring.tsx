// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Instruments } from "../pages/structuring/Instruments";
import { New } from "../pages/structuring/New";
import { App } from "./App";
import { Instrument } from "../pages/structuring/Instrument";
import { NewToken } from "../pages/structuring/other/NewToken";
import { NewGeneric } from "../pages/structuring/other/NewGeneric";
import { NewFixedRateBond } from "../pages/structuring/bond/NewFixedRateBond";
import { NewFloatingRateBond } from "../pages/structuring/bond/NewFloatingRateBond";
import { NewInflationLinkedBond } from "../pages/structuring/bond/NewInflationLinkedBond";
import { NewZeroCouponBond } from "../pages/structuring/bond/NewZeroCouponBond";
import { NewStock } from "../pages/structuring/equity/NewStock";
import { NewPrivateEquity } from "../pages/structuring/equity/NewPrivateEquity";

export const Structuring : React.FC = () => {
  const entries = [
    { label: "Instruments",     path: "instruments",  element: <Instruments /> },
    { label: "New Instrument",  path: "new",          element: <New />, action: true }
  ];
  const paths = [
    { path: "new/equity/stock", element: <NewStock /> },
    { path: "new/equity/pe", element: <NewPrivateEquity /> },
    { path: "new/bond/fixedrate", element: <NewFixedRateBond /> },
    { path: "new/bond/floatingrate", element: <NewFloatingRateBond /> },
    { path: "new/bond/inflationlinked", element: <NewInflationLinkedBond /> },
    { path: "new/bond/zerocoupon", element: <NewZeroCouponBond /> },
    { path: "new/other/token", element: <NewToken /> },
    { path: "new/other/generic", element: <NewGeneric /> },
    { path: "instruments/:key", element: <Instrument /> }
  ];
  return <App app="Structuring" entries={entries} paths={paths} />;
}
