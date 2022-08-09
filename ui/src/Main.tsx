// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import ErrorComponent from "./pages/error/Error";
import { useUserState } from "./context/UserContext";
import { Login } from "./pages/login/Login";
import { Apps } from "./Apps";
import DamlLedger from "@daml/react";
import { httpBaseUrl, wsBaseUrl } from "./config";
import { Servicing } from "./apps/Servicing";
import { Custody } from "./apps/Custody";
import { Issuance } from "./apps/Issuance";
import { Distribution } from "./apps/Distribution";
import { Listing } from "./apps/Listing";
import { Trading } from "./apps/Trading";
import { Origination } from "./apps/Origination";
import { createTheme, CssBaseline, ThemeOptions, ThemeProvider } from "@mui/material";
import { Simulation } from "./apps/Simulation";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { useBranding } from "./context/BrandingContext";
import { Network } from "./apps/Network";

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
              <Route path="/login" element={<Login />} />
              <Route path="/apps" element={<Private><Apps /></Private>} />
              <Route path="/origination/*" element={<Origination />} />
              <Route path="/issuance/*" element={<Issuance />} />
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

  // function RootRoute() {
  //   var userDispatch = useUserDispatch();
  //   useEffect(() => {
  //     const url = new URL(window.location.toString());
  //     const token = url.searchParams.get('token');
  //     const party = url.searchParams.get('party');
  //     if (token === null || party === null) return;
  //     localStorage.setItem("daml.name", party);
  //     localStorage.setItem("daml.party", party);
  //     localStorage.setItem("daml.token", token);
  //     userDispatch({ type: "LOGIN_SUCCESS", name: party, party, token });
  //   })

  //   return (<Navigate to="/apps" />)
  // }

  function Private({ children } : any) {
    return user.isAuthenticated ? children : <Navigate to="/login" />;
  }
}
