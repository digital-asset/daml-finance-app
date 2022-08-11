// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import { useScenario } from './ScenarioContext';
import parties from "../parties.json";
import React, { useMemo, useState } from 'react';

const createToken = (party : string, pub : string) => {
  const payload = {
    ledgerId: "sandbox",
    applicationId: "daml-finance-app",
    admin: true,
    actAs: [party],
    readAs: [party, pub]
  };
  return encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
};

export type PartiesState = {
  partyIds : string[]
  partyNames : string[]
  partyTokens : string[]
  getParty : (name : string) => string,
  getName : (id : string) => string,
  getToken : (id : string) => string,
}

const PartiesContext = React.createContext<PartiesState>({ partyIds: [], partyNames: [], partyTokens: [], getParty: (name : string) => "", getName: (id : string) => "", getToken: (id : string) => "" });

export const PartiesProvider : React.FC = ({ children }) => {
  const scenario = useScenario();
  const [partyIds, setPartyIds] = useState<any>({});
  const [partyNames, setPartyNames] = useState<any>({});
  const [partyTokens, setPartyTokens] = useState<any>({});

  useMemo(() => {
    const filtered = parties.filter(p => p.scenario === scenario.selected.name);
    const pIds : any = {};
    const pNames : any = {};
    const pTokens : any = {};
    filtered.forEach((p : any) => pIds[p.name] = p.id);
    filtered.forEach((p : any) => pNames[p.id] = p.name);
    filtered.forEach((p : any) => pTokens[p.id] = createToken(p.id, pIds["Public"]));
    setPartyIds(pIds);
    setPartyNames(pNames);
    setPartyTokens(pTokens);
  }, [scenario]);

  const getParty = (name : string) => (partyIds[name] || "") as string;
  const getName = (id : string) => (partyNames[id] || "") as string;
  const getToken = (id : string) => (partyTokens[id] || "") as string;

  return (
    <PartiesContext.Provider value={{ partyIds, partyNames, partyTokens, getParty, getName, getToken }}>
        {children}
    </PartiesContext.Provider>
  );
}

export const useParties = () => {
  return React.useContext(PartiesContext);
}
