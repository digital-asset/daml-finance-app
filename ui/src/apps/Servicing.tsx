// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Effects } from "../pages/servicing/Effects";
import { Effect } from "../pages/servicing/Effect";
import { Observables } from "../pages/servicing/Observables";
import { App } from "./App";
import { Instruments } from "../pages/servicing/Instruments";
import { Instrument } from "../pages/servicing/Instrument";
import { Pricing } from "../pages/servicing/Pricing";
import { Requests } from "../pages/servicing/Requests";
import { Request } from "../pages/servicing/Request";
import { Fulfilled } from "../pages/servicing/Fulfilled";

export const Servicing : React.FC = () => {
  const entries = [
    { label: "Instruments", path: "instruments", element: <Instruments /> },
    { label: "Effects", path: "effects", element: <Effects /> },
    { label: "Observables", path: "observables", element: <Observables /> },
    { label: "Pricing", path: "pricing", element: <Pricing /> },
    { label: "Requests", path: "requests", element: < Requests/>},
    { label: "Fulfilled", path: "fulfilled", element: < Fulfilled />}
  ];
  const paths = [
    { path: "instruments/:contractId", element: <Instrument /> },
    { path: "effects/:contractId", element: <Effect /> },
    { path: "requests/:contractId", element: <Request />}
  ];
  return <App app="Servicing" entries={entries} paths={paths} />;
}
