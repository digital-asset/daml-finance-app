import React from "react";
import { Agreements } from "../pages/collateral/Agreements";
import { MarginCalls } from "../pages/collateral/MarginCalls";
// import { Agreement } from "../pages/collateral/Agreement";
import { App } from "./App";

export const Collateral : React.FC = () => {
  const entries =
    [ { label: "Agreements", path: "agreements", element: <Agreements /> },
      { label: "MarginCalls", path: "margincalls", element: <MarginCalls /> },];
  return <App app="Collateral" entries={entries} paths={[]} />;
}
