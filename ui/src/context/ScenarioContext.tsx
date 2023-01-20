// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
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
import { Scenario as BondIssuance } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/BondIssuance";
import { Scenario as CorporateActions } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/CorporateActions";
import { Scenario as DecentralizedFinance } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/DecentralizedFinance";
import { Scenario as Default } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/Default";
import { Scenario as FundTokenization } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/FundTokenization";
import { Scenario as NaturalGas } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/NaturalGas";
import { Scenario as SecuritiesLending } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/SecuritiesLending";
import { Scenario as StructuredNotes } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/StructuredNotes";

type Position = {
  x : number
  y : number
};

type PartyPosition = {
  party : PartyInfo
  position : Position
};

export type Scenario = {
  name : string,
  description : string,
  apps: string[],
  parties : PartyPosition[],
  useNetworkLogin: boolean,
  isInitialized: boolean,
};

type ScenarioState = {
  selected : Scenario
  scenarios : Scenario[]
  select : (name : string) => Scenario
  initialize : (scenario : Scenario) => void
  loading : boolean
};

type AppInfo = {
  name : string
  element : JSX.Element
};

type SetupInfo = {
  scenario : string
  templateId : string
  choice : string
};

export const applications : AppInfo[] = [
  { name: "Structuring", element: <App key={0}  name="Structuring"   description="Structure and design new assets"         image={appStructuring}  path="/app/structuring/instruments" /> },
  { name: "Issuance", element: <App key={1}  name="Issuance"      description="Issue new assets"                        image={appIssuance}     path="/app/issuance/issuances" /> },
  { name: "Custody", element: <App key={2}  name="Custody"       description="Manage assets in custody"                image={appCustody}      path="/app/custody/assets" /> },
  { name: "DeFi", element: <App key={3}  name="DeFi"          description="Explore Decentralized Finance protocols" image={appDefi}         path="/app/defi/exchanges" /> },
  { name: "Distribution", element: <App key={4}  name="Distribution"  description="Distribute assets in the primary market" image={appDistribution} path="/app/distribution/auctions" /> },
  { name: "Lending", element: <App key={5}  name="Lending"       description="Borrow and lend securities"              image={appLending}      path="/app/lending/trades" /> },
  { name: "Servicing", element: <App key={6}  name="Servicing"     description="Service and lifecycle your assets"       image={appServicing}    path="/app/servicing/instruments" /> },
  { name: "Simulation", element: <App key={7}  name="Simulation"    description="Run market scenarios on your assets"     image={appSimulation}   path="/app/simulation/scenario" /> },
  { name: "Listing", element: <App key={8}  name="Listing"       description="List your assets on trading venues"      image={appListing}      path="/app/listing/listings" /> },
  { name: "Trading", element: <App key={9}  name="Trading"       description="Trade assets in the secondary market"    image={appTrading}      path="/app/trading/markets" /> },
  { name: "Network", element: <App key={10} name="Network"       description="Explore the distributed ledger network"  image={appNetwork}      path="/app/network/overview" /> },
  { name: "Settlement", element: <App key={11} name="Settlement"    description="Settle instructions in batches"          image={appSimulation}   path="/app/settlement/batches" /> },
];

export const setups : SetupInfo[] = [
  { scenario: "Bond Issuance",          templateId: BondIssuance.templateId,          choice: "Setup" },
  { scenario: "Corporate Actions",      templateId: CorporateActions.templateId,      choice: "Setup" },
  { scenario: "Decentralized Finance",  templateId: DecentralizedFinance.templateId,  choice: "Setup" },
  { scenario: "Default",                templateId: Default.templateId,               choice: "Setup" },
  { scenario: "Fund Tokenization",      templateId: FundTokenization.templateId,      choice: "Setup" },
  { scenario: "Natural Gas",            templateId: NaturalGas.templateId,            choice: "Setup" },
  { scenario: "Securities Lending",     templateId: SecuritiesLending.templateId,     choice: "Setup" },
  { scenario: "Structured Notes",       templateId: StructuredNotes.templateId,       choice: "Setup" },
];

const createParty = (name: string, x: number, y: number) : PartyPosition => {
  return { party: { displayName: name, identifier: "", isLocal: true, scenario: "" }, position: { x, y }};
};

const defaultScenarios : Scenario[] = [
  {
    name: "Default",
    description: "Primary and secondary markets workflows",
    apps: [ "Structuring", "Issuance", "Custody", "Distribution", "Servicing", "Simulation", "Listing", "Trading", "Network", ],
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
    isInitialized: false,
  },
  {
    name: "Bond Issuance",
    description: "Simple bond issuance custody scenario",
    apps: [ "Structuring", "Issuance", "Custody", "Distribution", "Servicing", "Listing", "Trading", "Settlement", "Network", ],
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
    name: "Corporate Actions",
    description: "Equity workflows for corporate actions",
    apps: [ "Structuring", "Issuance", "Custody", "Distribution", "Servicing", "Listing", "Trading", "Settlement", "Network", ],
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
    name: "Securities Lending",
    description: "Stock borrowing and lending scenario",
    apps: [ "Structuring", "Issuance", "Custody", "Lending", "Servicing", "Settlement", "Network", ],
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
    name: "Natural Gas",
    description: "Modeling complex commodity trades",
    apps: [ "Structuring", "Issuance", "Custody", "Servicing", "Network", ],
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
    name: "Structured Notes",
    description: "Synchronized issuance for structured products",
    apps: [ "Structuring", "Issuance", "Custody", "Distribution", "Servicing", "Listing", "Trading", "Settlement", "Network", ],
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
    name: "Fund Tokenization",
    description: "Issuance and distribution of funds",
    apps: [ "Structuring", "Issuance", "Custody", "Distribution", "Servicing", "Listing", "Trading", "Settlement", "Network", ],
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
    name: "Decentralized Finance",
    description: "Experimental Decentralized Financial protocols",
    apps: [ "Custody", "DeFi", "Network", ],
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

const defaultState : ScenarioState = { selected: defaultScenarios[0], scenarios: defaultScenarios, select: _ => defaultScenarios[0], initialize: _ => null, loading: true };
const ScenarioContext = React.createContext<ScenarioState>(defaultState);

export const ScenarioProvider : React.FC = ({ children }) => {
  const { loading, ledgerId } = useAdmin();
  const [ state, setState ] = useState<ScenarioState>(defaultState);

  // TODO: Check if this could be racy
  const initialize = (scenario : Scenario) => {
    if (loading) throw new Error("Trying to initialize scenario but still loading");
    const scenariosKey = ledgerId + ".scenarios";
    const newScenarios = state.scenarios.map(s => s.name === scenario.name ? scenario : s);
    console.log("Storing scenarios for " + scenariosKey);
    localStorage.setItem(scenariosKey, JSON.stringify(newScenarios));
    if (state.selected.name === scenario.name) setState({ ...state, scenarios: newScenarios, selected: scenario });
    else setState(s => ({ ...s, scenarios: newScenarios }));
  };

  const select = (name : string) : Scenario => {
    if (loading) throw new Error("Trying to select scenario but still loading");
    const scenarioKey = ledgerId + ".scenario";
    const selected = state.scenarios.find(s => s.name === name);
    if (!selected) throw new Error("Couldn't find scenario " + name);
    localStorage.setItem(scenarioKey, name);
    setState(s => ({ ...s, selected }));
    return selected;
  }

  useEffect(() => {
    if (loading) return;

    const scenariosKey = ledgerId + ".scenarios";
    const storedScenariosString = localStorage.getItem(scenariosKey);
    const scenarios : Scenario[] = !!storedScenariosString ? JSON.parse(storedScenariosString) : defaultScenarios;

    const scenarioKey = ledgerId + ".scenario";
    const scenarioName = localStorage.getItem(scenarioKey) || "Default";
    const selected = scenarios.find(s => s.name === scenarioName);
    if (!selected) throw new Error("Couldn't find scenario " + scenarioName);

    console.log("Scenario: " + scenarioName);
    setState(s => ({ ...s, loading: false , selected, scenarios}));
  }, [loading, ledgerId]);

  return (
    <ScenarioContext.Provider value={{ ...state, select, initialize }}>
        {children}
    </ScenarioContext.Provider>
  );
}

export const useScenarios = () => {
  return React.useContext(ScenarioContext);
}
