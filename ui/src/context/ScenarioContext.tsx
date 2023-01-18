// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { App } from "../components/Card/App";
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
import { PartyInfo, useAdmin } from "./AdminContext";

type Position = {
  x : number
  y : number
};

type PartyPosition = {
  party : PartyInfo
  position : Position
};

export type Scenario = {
  label : string,
  description : string,
  apps: AppInfo[],
  parties : PartyPosition[],
  useNetworkLogin: boolean,
  isInitialized: boolean
};

export type ScenarioState = {
  selected : Scenario
  scenarios : Scenario[]
  select : (name : string) => Scenario
  initialize : (scenario : Scenario) => void
}

type AppInfo = {
  name : string
  path : string
  elem : JSX.Element
}

const structuring   = { name: "Structuring",  path: "structuring",  elem: <App key={0}  label="Structuring"   description="Structure and design new assets"         image={appStructuring}  path="/app/structuring/instruments" /> };
const issuance      = { name: "Issuance",     path: "issuance",     elem: <App key={1}  label="Issuance"      description="Issue new assets"                        image={appIssuance}     path="/app/issuance/issuances" /> };
const custody       = { name: "Custody",      path: "custody",      elem: <App key={2}  label="Custody"       description="Manage assets in custody"                image={appCustody}      path="/app/custody/assets" /> };
const defi          = { name: "DeFi",         path: "defi",         elem: <App key={3}  label="DeFi"          description="Explore Decentralized Finance protocols" image={appDefi}         path="/app/defi/exchanges" /> };
const distribution  = { name: "Distribution", path: "distribution", elem: <App key={4}  label="Distribution"  description="Distribute assets in the primary market" image={appDistribution} path="/app/distribution/auctions" /> };
const lending       = { name: "Lending",      path: "lending",      elem: <App key={5}  label="Lending"       description="Borrow and lend securities"              image={appLending}      path="/app/lending/trades" /> };
const servicing     = { name: "Servicing",    path: "servicing",    elem: <App key={6}  label="Servicing"     description="Service and lifecycle your assets"       image={appServicing}    path="/app/servicing/instruments" /> };
const simulation    = { name: "Simulation",   path: "simulation",   elem: <App key={7}  label="Simulation"    description="Run market scenarios on your assets"     image={appSimulation}   path="/app/simulation/scenario" /> };
const listing       = { name: "Listing",      path: "listing",      elem: <App key={8}  label="Listing"       description="List your assets on trading venues"      image={appListing}      path="/app/listing/listings" /> };
const trading       = { name: "Trading",      path: "trading",      elem: <App key={9}  label="Trading"       description="Trade assets in the secondary market"    image={appTrading}      path="/app/trading/markets" /> };
const network       = { name: "Network",      path: "network",      elem: <App key={10} label="Network"       description="Explore the distributed ledger network"  image={appNetwork}      path="/app/network/overview" /> };
const settlement    = { name: "Settlement",   path: "settlement",   elem: <App key={11} label="Settlement"    description="Settle instructions in batches"          image={appSimulation}   path="/app/settlement/batches" /> };

const createParty = (name: string, x: number, y: number) : PartyPosition => {
  return { party: { displayName: name, identifier: "", isLocal: true, scenario: "" }, position: { x, y }};
};

const defaultScenarios : Scenario[] = [
  {
    label: "Default",
    description: "Primary and secondary markets workflows",
    apps: [ structuring, issuance, custody, distribution, servicing, simulation, listing, trading, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("CentralBank",   400,   0),
      createParty("Registry",      800,  50),
      createParty("Exchange",      800, 550),
      createParty("Agent",         400, 600),
      createParty("Issuer",       1200, 300),
      createParty("Investor1",       0, 300),
      createParty("Investor2",     400, 300),
      createParty("Investor3",     800, 300)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Bond Issuance",
    description: "Simple bond issuance custody scenario",
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("CentralBank",   400,   0),
      createParty("Registry",      800,   0),
      createParty("Custodian",     400, 300),
      createParty("Issuer",        800, 300),
      createParty("Investor1",       0, 600),
      createParty("Investor2",     400, 600),
      createParty("Investor3",     800, 600)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Corporate Actions",
    description: "Equity workflows for corporate actions",
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("CentralBank",   400,   0),
      createParty("Registry",      800,   0),
      createParty("Custodian",     400, 300),
      createParty("Issuer",        800, 300),
      createParty("Investor1",       0, 600),
      createParty("Investor2",     400, 600),
      createParty("Investor3",     800, 600)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Securities Lending",
    description: "Stock borrowing and lending scenario",
    apps: [ structuring, issuance, custody, lending, servicing, settlement, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("CentralBank",   400,   0),
      createParty("Registry",      800,   0),
      createParty("Borrower",      400, 400),
      createParty("Lender",        800, 200)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Natural Gas",
    description: "Modeling complex commodity trades",
    apps: [ structuring, issuance, custody, servicing, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("CentralBank",   200,   0),
      createParty("Seller",        400, 200),
      createParty("Buyer",           0, 400)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Structured Notes",
    description: "Synchronized issuance for structured products",
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    parties: [
      createParty("Operator",        0,   0),
      createParty("Public",          0,   0),
      createParty("Depository",      0,   0),
      createParty("CentralBank",   200,   0),
      createParty("Issuer",        100, 300),
      createParty("RiskTaker",       0, 150),
      createParty("Investor1",     200, 450),
      createParty("Investor2",     400, 450),
      createParty("Investor3",     600, 450)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Fund Tokenization",
    description: "Issuance and distribution of funds",
    apps: [ structuring, issuance, custody, distribution, servicing, listing, trading, settlement, network ],
    parties: [
      createParty("Operator",             0,   0),
      createParty("Public",               0,   0),
      createParty("CashProvider",       300,   0),
      createParty("AssetManager",       300, 300),
      createParty("PortfolioManager",     0, 300),
      createParty("Custodian",            0, 150),
      createParty("Investor1",            0, 450),
      createParty("Investor2",          300, 525),
      createParty("Investor3",          600, 450)
    ],
    useNetworkLogin: true,
    isInitialized: false
  },
  {
    label: "Decentralized Finance",
    description: "Experimental Decentralized Financial protocols",
    apps: [ custody, defi, network ],
    parties: [
      createParty("Operator",       0,   0),
      createParty("Public",         0,   0),
      createParty("FED",            0,   0),
      createParty("ECB",          200,   0),
      createParty("SNB",          400,   0),
      createParty("BOE",          600,   0),
      createParty("Consortium",   200, 300),
      createParty("Trader",       400, 300),
    ],
    useNetworkLogin: true,
    isInitialized: false
  }
];

const ScenarioContext = React.createContext<ScenarioState>({ selected: defaultScenarios[0], scenarios: defaultScenarios, select: _ => defaultScenarios[0], initialize: _ => null });

export const ScenarioProvider : React.FC = ({ children }) => {
  const { ledgerId } = useAdmin();
  const scenarioKey = ledgerId + ".scenario";
  const scenariosKey = ledgerId + ".scenarios";

  const storedScenariosString = localStorage.getItem(scenariosKey);
  console.log(scenariosKey);
  const storedScenarios : Scenario[] = !!storedScenariosString ? JSON.parse(storedScenariosString) : defaultScenarios;
  const storedScenario = localStorage.getItem(scenarioKey) || "Default";
  const scenario = storedScenarios.find(s => s.label === storedScenario);
  if (!scenario) throw new Error("Couldn't find scenario " + storedScenario);

  const [ selected, setSelected ] = useState<Scenario>(scenario);
  const [ scenarios, setScenarios ] = useState<Scenario[]>(storedScenarios);

  const select = (name : string) : Scenario => {
    const s = scenarios.find(s => s.label === name);
    if (!s) throw new Error("Couldn't find scenario " + name);
    localStorage.setItem(scenarioKey, name);
    setSelected(s);
    return s;
  }

  const initialize = (scenario : Scenario) => {
    const newScenarios = scenarios.map(s => s.label === scenario.label ? scenario : s);
    console.log("Storing scenarios for " + scenariosKey);
    localStorage.setItem(scenariosKey, JSON.stringify(newScenarios));
    setScenarios(newScenarios);
    if (selected.label === scenario.label) setSelected(scenario);
  };

  return (
    <ScenarioContext.Provider value={{ selected, scenarios, select, initialize }}>
        {children}
    </ScenarioContext.Provider>
  );
}

export const useScenario = () => {
  return React.useContext(ScenarioContext);
}
