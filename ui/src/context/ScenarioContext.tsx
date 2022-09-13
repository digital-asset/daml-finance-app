// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import bondIssuanceImage from "../images/bondIssuance.png";
import defaultImage from "../images/defaultScenario.png";
import structuredNotesImage from "../images/structuredNotesScenario.png";
import naturalGasImage from "../images/naturalGasScenario.png";

type Position = {
  x : number
  y : number
};

export type Scenario = {
  label : string,
  description : string,
  image : string,
  positions : Map<string, Position>,
  useNetworkLogin: boolean
};

export type ScenarioState = {
  selected : Scenario
  select : (name : string) => Scenario
}

export const scenarios : Scenario[] = [
  {
    label: "Default",
    description: "Primary and secondary markets workflows",
    image: defaultImage,
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:  50 } ],
      [ "Exchange",     { x:  800, y: 550 } ],
      [ "Agent",        { x:  400, y: 600 } ],
      [ "Issuer",       { x: 1200, y: 300 } ],
      [ "Alice",        { x:    0, y: 300 } ],
      [ "Bob",          { x:  400, y: 300 } ],
      [ "Charlie",      { x:  800, y: 300 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Bond Issuance",
    description: "Simple bond issuance custody scenario",
    image: bondIssuanceImage,
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:   0 } ],
      [ "BNY",          { x:  400, y: 300 } ],
      [ "Issuer",       { x:  800, y: 300 } ],
      [ "Alice",        { x:    0, y: 600 } ],
      [ "Bob",          { x:  400, y: 600 } ],
      [ "Charlie",      { x:  800, y: 600 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Natural Gas",
    description: "Modeling complex commodity trades",
    image: naturalGasImage,
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  200, y:   0 } ],
      [ "Seller",       { x:  400, y: 200 } ],
      [ "Buyer",        { x:    0, y: 400 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Structured Notes",
    description: "Synchronized issuance for structured products",
    image: structuredNotesImage,
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "Depository",   { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  200, y:   0 } ],
      [ "Issuer",       { x:  100, y: 300 } ],
      [ "RiskTaker",    { x:    0, y: 150 } ],
      [ "Alice",        { x:  200, y: 450 } ],
      [ "Bob",          { x:  400, y: 450 } ],
      [ "Charlie",      { x:  600, y: 450 } ]
    ]),
    useNetworkLogin: true
  }
];

const ScenarioContext = React.createContext<ScenarioState>({ selected: scenarios[0], select: _ => scenarios[0] });

export const ScenarioProvider : React.FC = ({ children }) => {
  const scenarioName = localStorage.getItem("daml.scenario") || "Default";
  const scenario = scenarios.find(s => s.label === scenarioName);
  if (!scenario) throw new Error("Couldn't find scenario " + scenarioName);

  const [ selected, setSelected ] = useState(scenario);

  const select = (name : string) : Scenario => {
    const s = scenarios.find(s => s.label === name);
    if (!s) throw new Error("Couldn't find scenario " + name);
    localStorage.setItem("daml.scenario", name);
    setSelected(s);
    return s;
  }

  return (
    <ScenarioContext.Provider value={{ selected, select }}>
        {children}
    </ScenarioContext.Provider>
  );
}

export const useScenario = () => {
  return React.useContext(ScenarioContext);
}
