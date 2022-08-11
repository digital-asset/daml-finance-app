// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import useStyles from "./styles";
import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { ServicesProvider } from "../context/ServicesContext";
import { InstrumentsProvider } from "../context/InstrumentsContext";

type AppProps = {
  title : string
  entries : RouteEntry[]
}

export const App : React.FC<AppProps> = ({ title, entries } : AppProps) => {
  const classes = useStyles();

  return (
    <ServicesProvider>
      <InstrumentsProvider>
        <div className={classes.root}>
          <>
            <Header app={title} />
            <Sidebar entries={entries.filter(e => !!e.label)} />
            <div className={classes.content}>
              <div className={classes.fakeToolbar} />
              <Routes>
                {entries.map(e =>
                  <Route key={e.path} path={e.path} element={e.element} />
                )}
              </Routes>
              <Outlet />
            </div>
          </>
        </div>
      </InstrumentsProvider>
    </ServicesProvider>
  );
}
