// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { Instruments } from "../pages/structuring/Instruments";
import { New } from "../pages/structuring/New";
import { App } from "./App";
import { Instrument } from "../pages/structuring/Instrument";
import { NewBase } from "../pages/structuring/other/NewBase";
import { NewGeneric } from "../pages/structuring/other/NewGeneric";
import { NewFixedRateBond } from "../pages/structuring/bond/NewFixedRateBond";
import { NewFloatingRateBond } from "../pages/structuring/bond/NewFloatingRateBond";
import { NewInflationLinkedBond } from "../pages/structuring/bond/NewInflationLinkedBond";
import { NewZeroCouponBond } from "../pages/structuring/bond/NewZeroCouponBond";

export const Structuring : React.FC = () => {
  const entries : RouteEntry[] =
    [ { path: "instruments", element: <Instruments />, label: "Instruments", icon: <PlayArrow/> }
    , { path: "new", element: <New />, label: "New", icon: <PlayArrow/> }
    , { path: "new/bond/fixedrate", element: <NewFixedRateBond /> }
    , { path: "new/bond/floatingrate", element: <NewFloatingRateBond /> }
    , { path: "new/bond/inflationlinked", element: <NewInflationLinkedBond /> }
    , { path: "new/bond/zerocoupon", element: <NewZeroCouponBond /> }
    , { path: "new/other/base", element: <NewBase /> }
    , { path: "new/other/generic", element: <NewGeneric /> }
    , { path: "instruments/:key", element: <Instrument /> } ];
  return <App title="Structuring" entries={entries} />;
}
