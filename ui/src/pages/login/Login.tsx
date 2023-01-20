// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DamlLedger from "@daml/react";
import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/Spinner/Spinner";
import { httpBaseUrl, wsBaseUrl } from "../../config";
import { useAdmin } from "../../context/AdminContext";
import { useParties } from "../../context/PartiesContext";
import { useScenarios } from "../../context/ScenarioContext";
import { ServicesProvider } from "../../context/ServicesContext";
import { Form } from "./Form";
import { Network } from "./Network";

export const Login : React.FC = () => {
  const navigate = useNavigate();
  const { loading: l1, getMultiPartyToken } = useAdmin();
  const { loading: l2, selected } = useScenarios();
  const { loading: l3, getParty } = useParties();
  const [ token, setToken ] = useState("");

  const operator = getParty("Operator");

  useEffect(() => {
    const loadToken = async () => {
      const token = await getMultiPartyToken(selected.parties.map(p => p.party.identifier));
      setToken(token);
    };
    if (!l1 && !l2 && !l3 && !!selected.parties[0].party.identifier) loadToken();
    if (!l1 && !l2 && !l3 && !selected.parties[0].party.identifier) navigate("/login/portal");
  }, [l1, l2, l3, navigate, selected, getParty, getMultiPartyToken]);

  if (!token) return <Spinner />;

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
