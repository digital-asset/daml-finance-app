// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DamlLedger from "@daml/react";
import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { httpBaseUrl, wsBaseUrl } from "../../config";
import { useParties } from "../../context/PartiesContext";
import { ServicesProvider } from "../../context/ServicesContext";
import { Form } from "./Form";
import { Network } from "./Network";

export const Login : React.FC = () => {
  const navigate = useNavigate();
  const { getParty, getToken } = useParties();
  const operator = getParty("Operator");
  const token = getToken(operator);

  useEffect(() => {
    if (!operator) navigate("init");
  }, [operator, navigate]);

  if (!operator) return (<></>);
  return (
    <DamlLedger party={operator} token={token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
      <ServicesProvider>
        <Routes>
          <Route key={"form"} path={"form"} element={<Form />} />
          <Route key={"network"} path={"network"} element={<Network />} />
        </Routes>
      </ServicesProvider>
    </DamlLedger>
  );
}
