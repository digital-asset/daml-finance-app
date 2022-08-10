// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DamlLedger from "@daml/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { httpBaseUrl, wsBaseUrl } from "../../config";
import { useParties } from "../../hooks/Parties";
import { Form } from "./Form";
import { Network } from "./Network";

export const Root : React.FC = () => {
  const { getParty, getToken } = useParties();
  const operator = getParty("Operator");
  const token = getToken(operator);

  return (
    <DamlLedger party={operator} token={token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
      <Routes>
        <Route key={"form"} path={"form"} element={<Form />} />
        <Route key={"network"} path={"network"} element={<Network />} />
      </Routes>
    </DamlLedger>
  );
}
