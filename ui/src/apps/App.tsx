// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import useStyles from "./styles";
import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { Entry, Path } from "../components/Sidebar/Route";

type AppProps = {
  app : string
  entries : Entry[]
  paths : Path[]
}

export const App : React.FC<AppProps> = ({ app, entries, paths } : AppProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <>
        <Header />
        <Sidebar app={app} entries={entries} />
        <div className={classes.content}>
          <div className={classes.fakeToolbar} />
          <Routes>
            {paths.map(p => <Route key={p.path} path={p.path} element={p.element} />)}
            {entries.map(e => <Route key={e.path} path={e.path} element={e.element} />)}
          </Routes>
          <Outlet />
        </div>
      </>
    </div>
  );
}
