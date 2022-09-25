// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import bondIssuanceImage from "../images/bondIssuance.png";
import defaultImage from "../images/defaultScenario.png";
import structuredNotesImage from "../images/structuredNotesScenario.png";
import naturalGasImage from "../images/naturalGasScenario.png";
import { App } from "../components/Card/App";
import structuringImage from "../images/structuring.png";
import issuanceImage from "../images/issuance.jpg";
import lendingImage from "../images/lending.jpg";
import custodyImage from "../images/custody.jpg";
import distributionImage from "../images/distribution.jpg";
import lifecyclingImage from "../images/lifecycling.jpg";
import simulationImage from "../images/simulation.jpg";
import listingImage from "../images/listing.png";
import tradingImage from "../images/trading.jpg";
import networkImage from "../images/network.png";

type Position = {
  x : number
  y : number
};

export type Scenario = {
  label : string,
  description : string,
  apps: JSX.Element[],
  image : string,
  positions : Map<string, Position>,
  useNetworkLogin: boolean
};

export type ScenarioState = {
  selected : Scenario
  select : (name : string) => Scenario
}

const structuring  = <App key={0} label="Structuring"  description="Structure and design new assets"         image={structuringImage}   path="/structuring/instruments" />;
const issuance     = <App key={1} label="Issuance"     description="Issue new assets"                        image={issuanceImage}      path="/issuance/issuances" />;
const custody      = <App key={2} label="Custody"      description="Manage assets in custody"                image={custodyImage}       path="/custody/assets" />;
const distribution = <App key={3} label="Distribution" description="Distribute assets in the primary market" image={distributionImage}  path="/distribution/auctions" />;
const lending      = <App key={4} label="Lending"      description="Borrow and lend securities"              image={lendingImage}       path="/lending/trades" />;
const servicing    = <App key={5} label="Servicing"    description="Service and lifecycle your assets"       image={lifecyclingImage}   path="/servicing/instruments" />;
const simulation   = <App key={6} label="Simulation"   description="Run market scenarios on your assets"     image={simulationImage}    path="/simulation/scenario" />;
const listing      = <App key={7} label="Listing"      description="List your assets on trading venues"      image={listingImage}       path="/listing/listings" />;
const trading      = <App key={8} label="Trading"      description="Trade assets in the secondary market"    image={tradingImage}       path="/trading/markets" />;
const network      = <App key={9} label="Network"      description="Explore the distributed ledger network"  image={networkImage}       path="/network/overview" />;
const settlement   = <App key={10} label="Settlement"  description="Settle instructions in batches"          image={simulationImage}    path="/settlement/batches" />;

export const scenarios : Scenario[] = [
  {
    label: "Default",
    description: "Primary and secondary markets workflows",
    image: defaultImage,
    apps: [ structuring, issuance, custody, distribution, servicing, simulation, listing, trading, network ],
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:  50 } ],
      [ "Exchange",     { x:  800, y: 550 } ],
      [ "Agent",        { x:  400, y: 600 } ],
      [ "Issuer",       { x: 1200, y: 300 } ],
      [ "Investor1",    { x:    0, y: 300 } ],
      [ "Investor2",    { x:  400, y: 300 } ],
      [ "Investor3",    { x:  800, y: 300 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Bond Issuance",
    description: "Simple bond issuance custody scenario",
    image: bondIssuanceImage,
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:   0 } ],
      [ "Custodian",    { x:  400, y: 300 } ],
      [ "Issuer",       { x:  800, y: 300 } ],
      [ "Investor1",    { x:    0, y: 600 } ],
      [ "Investor2",    { x:  400, y: 600 } ],
      [ "Investor3",    { x:  800, y: 600 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Corporate Actions",
    description: "Equity workflows for corporate actions",
    image: bondIssuanceImage,
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:   0 } ],
      [ "Custodian",    { x:  400, y: 300 } ],
      [ "Issuer",       { x:  800, y: 300 } ],
      [ "Investor1",    { x:    0, y: 600 } ],
      [ "Investor2",    { x:  400, y: 600 } ],
      [ "Investor3",    { x:  800, y: 600 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Securities Lending",
    description: "Stock borrowing and lending scenario",
    image: bondIssuanceImage,
    apps: [ structuring, issuance, custody, lending, servicing, settlement, network ],
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  400, y:   0 } ],
      [ "Registry",     { x:  800, y:   0 } ],
      [ "Borrower",     { x:  400, y: 400 } ],
      [ "Lender",       { x:  800, y: 200 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Natural Gas",
    description: "Modeling complex commodity trades",
    image: naturalGasImage,
    apps: [ structuring, issuance, custody, servicing, network ],
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
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    image: structuredNotesImage,
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "Depository",   { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  200, y:   0 } ],
      [ "Issuer",       { x:  100, y: 300 } ],
      [ "RiskTaker",    { x:    0, y: 150 } ],
      [ "Investor1",    { x:  200, y: 450 } ],
      [ "Investor2",    { x:  400, y: 450 } ],
      [ "Investor3",    { x:  600, y: 450 } ]
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
