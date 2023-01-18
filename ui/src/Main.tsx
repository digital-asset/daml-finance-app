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
import { Init } from "./pages/login/Init";
import { useUser } from "./context/UserContext";

export const Main : React.FC = () => {
  const { party, token, isLoggedIn } = useUser();
  const branding = useBranding();
  const theme = React.useMemo(() => createTheme(branding.options), [branding]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <DamlLedger party={party} token={token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/app" />} />
              <Route path="/login/init" element={<Init />} />
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
    return isLoggedIn ? children : <Navigate to="/login/init" />;
  }
}
