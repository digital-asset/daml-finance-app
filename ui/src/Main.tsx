// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { createTheme, CssBaseline, ThemeOptions, ThemeProvider } from "@mui/material";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DamlLedger from "@daml/react";
import { useBranding } from "./context/BrandingContext";
import { useUserState } from "./context/UserContext";
import { Root } from "./Root";
import { Login } from "./pages/login/Login";
import { Portal } from "./pages/login/Portal";
import ErrorComponent from "./pages/error/Error";
import { httpBaseUrl, wsBaseUrl } from "./config";

export const Main : React.FC = () => {
  const user = useUserState();
  const branding = useBranding();

  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  // const theme = React.useMemo(() => createTheme({ palette: { mode: prefersDarkMode ? 'dark' : 'light' } }), [prefersDarkMode]);
  const theme = React.useMemo(() => {
    const options : ThemeOptions = {
      palette: {
        mode: branding.mode,
        primary: { main: branding.primary }, // #00345f
        secondary: { main: branding.secondary },
        text: {
          primary: "#4d4d4d",
          secondary: "#adadad"
        },
        background: { default: "#f5f5f5" }
      },
      typography: {
        fontFamily: '"GT Haptik",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Ubuntu",sans-serif;'
      },
      components: {
        MuiTextField: {
          defaultProps: {
            variant: "standard",
          }
        },
        MuiSelect: {
          defaultProps: {
            variant: "standard",
          },
        }
      },
    }
    return createTheme(options)
  }, [branding]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/app" />} />
              <Route path="/login" element={<Portal />} />
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
    return user.isAuthenticated ? children : <Navigate to="/login" />;
  }
}
