// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { App } from "../components/Card/App";
import scenarioBondIssuance from "../images/scenario/bondIssuance.png";
import scenarioCorporateActions from "../images/scenario/corporateActions.png";
import scenarioDefault from "../images/scenario/default.png";
import scenarioDecentralizedFinance from "../images/scenario/decentralizedFinance.png";
import scenarioFundTokenization from "../images/scenario/fundTokenization.png";
import scenarioSecuritiesLending from "../images/scenario/securitiesLending.png";
import scenarioStructuredNotes from "../images/scenario/structuredNotes.png";
import scenarioNaturalGas from "../images/scenario/naturalGas.png";
import appStructuring from "../images/app/structuring.png";
import appIssuance from "../images/app/issuance.png";
import appLending from "../images/app/lending.jpg";
import appCustody from "../images/app/custody.png";
import appDefi from "../images/app/defi.jpg";
import appDistribution from "../images/app/distribution.png";
import appServicing from "../images/app/servicing.png";
import appSimulation from "../images/app/simulation.png";
import appListing from "../images/app/listing.png";
import appTrading from "../images/app/trading.png";
import appNetwork from "../images/app/network.png";

type Position = {
  x : number
  y : number
};

export type Scenario = {
  label : string,
  description : string,
  apps: AppInfo[],
  image : string,
  positions : Map<string, Position>,
  useNetworkLogin: boolean
};

export type ScenarioState = {
  selected : Scenario
  select : (name : string) => Scenario
}

type AppInfo = {
  name : string
  path : string
  elem : JSX.Element
}

const structuring   = { name: "Structuring",  path: "structuring",  elem: <App key={0}  label="Structuring"   description="Structure and design new assets"         image={appStructuring}  path="/app/structuring/instruments" /> };
const issuance      = { name: "Issuance",     path: "issuance",     elem: <App key={1}  label="Issuance"      description="Issue new assets"                        image={appIssuance}     path="/app/issuance/issuances" /> };
const clearing      = { name: "Clearing",     path: "clearing",     elem: <App key={2}  label="Clearing"      description="Clear bilateral derivative trades"       image={appDistribution} path="/app/clearing/trades" /> };
const custody       = { name: "Custody",      path: "custody",      elem: <App key={3}  label="Custody"       description="Manage assets in custody"                image={appCustody}      path="/app/custody/assets" /> };
const defi          = { name: "DeFi",         path: "defi",         elem: <App key={4}  label="DeFi"          description="Explore Decentralized Finance protocols" image={appDefi}         path="/app/defi/exchanges" /> };
const distribution  = { name: "Distribution", path: "distribution", elem: <App key={5}  label="Distribution"  description="Distribute assets in the primary market" image={appDistribution} path="/app/distribution/auctions" /> };
const lending       = { name: "Lending",      path: "lending",      elem: <App key={6}  label="Lending"       description="Borrow and lend securities"              image={appLending}      path="/app/lending/trades" /> };
const servicing     = { name: "Servicing",    path: "servicing",    elem: <App key={7}  label="Servicing"     description="Service and lifecycle your assets"       image={appServicing}    path="/app/servicing/instruments" /> };
const simulation    = { name: "Simulation",   path: "simulation",   elem: <App key={8}  label="Simulation"    description="Run market scenarios on your assets"     image={appSimulation}   path="/app/simulation/scenario" /> };
const listing       = { name: "Listing",      path: "listing",      elem: <App key={9}  label="Listing"       description="List your assets on trading venues"      image={appListing}      path="/app/listing/listings" /> };
const quoting       = { name: "Quoting",      path: "quoting",      elem: <App key={10} label="Quoting"       description="Request trade quotes from dealers"       image={appTrading}      path="/app/quoting/quotes" /> };
const trading       = { name: "Trading",      path: "trading",      elem: <App key={11} label="Trading"       description="Trade assets in the secondary market"    image={appTrading}      path="/app/trading/markets" /> };
const network       = { name: "Network",      path: "network",      elem: <App key={12} label="Network"       description="Explore the distributed ledger network"  image={appNetwork}      path="/app/network/overview" /> };
const settlement    = { name: "Settlement",   path: "settlement",   elem: <App key={13} label="Settlement"    description="Settle instructions in batches"          image={appSimulation}   path="/app/settlement/batches" /> };

export const scenarios : Scenario[] = [
  {
    label: "Default",
    description: "Primary and secondary markets workflows",
    image: scenarioDefault,
    apps: [ structuring, issuance, custody, distribution, servicing, simulation, listing, trading, settlement ],
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
      [ "Investor3",    { x:  800, y: 300 } ], 
      [ "Oracle",       { x: 1400, y: 0 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "Bond Issuance",
    description: "Simple bond issuance custody scenario",
    image: scenarioBondIssuance,
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
    image: scenarioCorporateActions,
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
    image: scenarioSecuritiesLending,
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
    image: scenarioNaturalGas,
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
    image: scenarioStructuredNotes,
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
  },
  {
    label: "Fund Tokenization",
    description: "Issuance and distribution of funds",
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    image: scenarioFundTokenization,
    positions: new Map([
      [ "Operator",         { x:    0, y:   0 } ],
      [ "Public",           { x:    0, y:   0 } ],
      [ "CashProvider",     { x:  300, y:   0 } ],
      [ "AssetManager",     { x:  300, y: 300 } ],
      [ "PortfolioManager", { x:    0, y: 300 } ],
      [ "Custodian",        { x:    0, y: 150 } ],
      [ "Investor1",        { x:    0, y: 450 } ],
      [ "Investor2",        { x:  300, y: 525 } ],
      [ "Investor3",        { x:  600, y: 450 } ]
    ]),
    useNetworkLogin: true
  },
  {
    label: "OTC Swaps",
    description: "OTC swap quoting and trading",
    apps: [ structuring, quoting, custody, clearing, servicing, settlement ],
    image: scenarioSecuritiesLending,
    positions: new Map([
      [ "Operator",         { x:    0, y:   0 } ],
      [ "Public",           { x:    0, y:   0 } ],
      [ "CashProvider",     { x:    0, y:   0 } ],
      [ "Clearer",          { x:  300, y:   0 } ],
      [ "Seller",           { x:    0, y: 150 } ],
      [ "Buyer",            { x:  300, y: 300 } ],
    ]),
    useNetworkLogin: true
  },
  {
    label: "Decentralized Finance",
    description: "Experimental Decentralized Financial protocols",
    apps: [ custody, defi, network ],
    image: scenarioDecentralizedFinance,
    positions: new Map([
      [ "Operator",   { x:    0, y:   0 } ],
      [ "Public",     { x:    0, y:   0 } ],
      [ "FED",        { x:    0, y:   0 } ],
      [ "ECB",        { x:  200, y:   0 } ],
      [ "SNB",        { x:  400, y:   0 } ],
      [ "BOE",        { x:  600, y:   0 } ],
      [ "Consortium", { x:  200, y: 300 } ],
      [ "Trader",     { x:  400, y: 300 } ],
    ]),
    useNetworkLogin: true
  }
];

const ScenarioContext = React.createContext<ScenarioState>({ selected: scenarios[0], select: _ => scenarios[0] });

export const ScenarioProvider : React.FC = ({ children }) => {
  const scenarioName = localStorage.getItem("daml.scenario") || "Default";
  const scenario = scenarios.find(s => s.label === scenarioName) || scenarios.find(s => s.label === "Default");
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
