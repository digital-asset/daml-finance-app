// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { App } from "./App";
import { Confirmations } from "../pages/confirmation/Confirmations";
import { Confirmation as ConfirmationPage } from "../pages/confirmation/Confirmation";

export const Confirmation : React.FC = () => {
  const entries =
    [ { label: "Confirmations", path: "confirmations", element: <Confirmations /> } ];
  const paths =
    [ { path: "confirmations/:contractId", element: <ConfirmationPage /> } ];
  return <App app="Confirmation" entries={entries} paths={paths} />;
}
