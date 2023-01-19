// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import DamlLedger from "@daml/react";
import { useBranding } from "./context/BrandingContext";
import { Root } from "./Root";
import { Login } from "./pages/login/Login";
import { Portal } from "./pages/login/Portal";
import ErrorComponent from "./pages/error/Error";
import { httpBaseUrl, wsBaseUrl } from "./config";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useUser } from "./context/UserContext";
import { useScenarios } from "./context/ScenarioContext";
import { Spinner } from "./components/Spinner/Spinner";

export const Main : React.FC = () => {
  const { loading: l1, party, token, loggedIn } = useUser();
  const { loading: l2, selected } = useScenarios();
  const branding = useBranding();
  const theme = React.useMemo(() => createTheme(branding.options), [branding]);

  if (l1 || l2) return <Spinner />;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <DamlLedger party={party} token={token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/app" />} />
              <Route path="/login/portal" element={<Portal />} />
              <Route path="/login/*" element={<Login />} />
              <Route path="/app/*" element={<Private><Root /></Private>} />
              <Route element={<ErrorComponent />} />
            </Routes>
          </HashRouter>
        </DamlLedger>
      </LocalizationProvider>
    </ThemeProvider>
  );

  function Private({ children } : any) {
    const path = selected.useNetworkLogin ? "/login/network" : "/login/form";
    return loggedIn ? children : <Navigate to={path} />;
  };
}
