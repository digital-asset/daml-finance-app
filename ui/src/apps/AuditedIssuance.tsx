// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { NewAudited } from "../pages/issuance/NewAudited";
import { Requests } from "../pages/issuance/Requests";
import { Issuances } from "../pages/issuance/Issuances";
import { Issuance as IssuanceDetail } from "../pages/issuance/Issuance";
import { App } from "./App";

export const AuditedIssuance : React.FC = () => {
  const entries = [
    { label: "Issuances",     path: "issuances",  element: <Issuances /> },
    { label: "Requests",      path: "requests",   element: <Requests /> },
    { label: "New Issuance",  path: "newAudited",        element: <NewAudited />, action: true }
  ];
  const paths = [
    { path: "issuances/:contractId", element: <IssuanceDetail /> }
  ];

  return <App app="Issuance" entries={entries} paths={paths} />;
}
