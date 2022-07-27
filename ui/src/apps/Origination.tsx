// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
// import { Requests } from "../pages/origination/Requests";
import { Instruments } from "../pages/origination/Instruments";
// import { Instrument } from "../pages/origination/Instrument";
import { New } from "../pages/origination/New";
import { App } from "./App";
import { Instrument } from "../pages/origination/Instrument";
import { NewCustom } from "../pages/origination/NewCustom";
// import { NewBaseInstrument } from "../pages/origination/NewBaseInstrument";
// import { NewBinaryOption } from "../pages/origination/NewBinaryOption";
// import { NewFixedRateBond } from "../pages/origination/NewFixedRateBond";
// import { NewFloatingRateBond } from "../pages/origination/NewFloatingRateBond";
// import { NewCds } from "../pages/origination/NewCds";
// import { NewConvertibleNote } from "../pages/origination/NewConvertibleNote";
// import { NewTotalReturnSwap } from "../pages/origination/NewTotalReturnSwap";
// import { NewTurboWarrant } from "../pages/origination/NewTurboWarrant";

export const Origination : React.FC = () => {
  const entries : RouteEntry[] =
    [ { path: "instruments", element: <Instruments />, label: "Instruments", icon: <PlayArrow/> }
    // , { path: "requests", element: <Requests />, label: "Requests", icon: <PlayArrow/> }
    , { path: "new", element: <New />, label: "New", icon: <PlayArrow/> }
    // , { path: "new/base", element: <NewBaseInstrument /> }
    // , { path: "new/binaryoption", element: <NewBinaryOption /> }
    // , { path: "new/fixedratebond", element: <NewFixedRateBond /> }
    // , { path: "new/floatingratebond", element: <NewFloatingRateBond /> }
    // , { path: "new/cds", element: <NewCds /> }
    // , { path: "new/convertiblenote", element: <NewConvertibleNote /> }
    , { path: "new/custom", element: <NewCustom /> }
    // , { path: "new/totalreturnswap", element: <NewTotalReturnSwap /> }
    // , { path: "new/turbowarrant", element: <NewTurboWarrant /> }
    , { path: "instruments/:contractId", element: <Instrument /> } ];
  return <App title="Origination" entries={entries} />;
}
