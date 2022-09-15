// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import ErrorComponent from "./pages/error/Error";
import { useUserState } from "./context/UserContext";
import { Apps } from "./Apps";
import DamlLedger from "@daml/react";
import { httpBaseUrl, wsBaseUrl } from "./config";
import { Servicing } from "./apps/Servicing";
import { Custody } from "./apps/Custody";
import { Issuance } from "./apps/Issuance";
import { Distribution } from "./apps/Distribution";
import { Listing } from "./apps/Listing";
import { Trading } from "./apps/Trading";
import { Structuring } from "./apps/Structuring";
import { createTheme, CssBaseline, ThemeOptions, ThemeProvider } from "@mui/material";
import { Simulation } from "./apps/Simulation";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { useBranding } from "./context/BrandingContext";
import { Network } from "./apps/Network";
import { Root } from "./pages/login/Root";
import { Portal } from "./pages/login/Portal";
import { Lending } from "./apps/Lending";

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
              <Route path="/" element={<Navigate to="/apps" />} />
              <Route path="/login" element={<Portal />} />
              <Route path="/login/*" element={<Root />} />
              <Route path="/apps" element={<Private><Apps /></Private>} />
              <Route path="/structuring/*" element={<Structuring />} />
              <Route path="/issuance/*" element={<Issuance />} />
              <Route path="/lending/*" element={<Lending />} />
              <Route path="/custody/*" element={<Custody />} />
              <Route path="/distribution/*" element={<Distribution />} />
              <Route path="/servicing/*" element={<Servicing />} />
              <Route path="/simulation/*" element={<Simulation />} />
              <Route path="/listing/*" element={<Listing />} />
              <Route path="/trading/*" element={<Trading />} />
              <Route path="/network/*" element={<Network />} />
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
