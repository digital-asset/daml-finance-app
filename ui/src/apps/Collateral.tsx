import React from "react";
import { Agreements } from "../pages/collateral/Agreements";
// import { Agreement } from "../pages/collateral/Agreement";
import { App } from "./App";

export const Collateral : React.FC = () => {
  const entries =
    [ { label: "Agreements", path: "agreements", element: <Agreements /> }];

  // const paths =
  //   [ { path: "agreements/:contractId", element: <Agreement /> } ];
  return <App app="Clearing" entries={entries} paths={[]} />;
}
