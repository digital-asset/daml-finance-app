// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { New } from "../pages/audit/New";
import { Requests } from "../pages/audit/Requests";
import { Audits } from "../pages/audit/Audits";
import { Audit as AuditDetail } from "../pages/audit/Audit";

import { App } from "./App";

export const Audit : React.FC = () => {
  const entries = [
    { label: "Audits",     path: "audits",     element: <Audits /> },
    { label: "Requests",   path: "requests",   element: <Requests /> },
    { label: "New Audit",  path: "new",        element: <New />, action: true }
  ];
  const paths = [
    { path: "audits/:contractId", element: <AuditDetail /> }
  ];

  return <App app="Audit" entries={entries} paths={paths} />;
  
}
