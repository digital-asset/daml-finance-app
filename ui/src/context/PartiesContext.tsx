// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { encode } from 'jwt-simple';
import { useScenario } from './ScenarioContext';
import parties from "../parties.json";
import { Set } from "@daml.js/97b883cd8a2b7f49f90d5d39c981cf6e110cf1f1c64427a28a6d58ec88c43657/lib/DA/Set/Types"
import { values } from '../util';

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

export type PartyState = {
  users : string[]
  getParty : (name : string) => string,
  getName : (id : string) => string,
  getNames : (ids : Set<string>) => string,
  getToken : (id : string) => string,
}

const empty = {
  users: [],
  getParty: (name : string) => "",
  getName: (id : string) => "",
  getNames: (ids : Set<string>) => "",
  getToken: (id : string) => ""
}
const PartyContext = React.createContext<PartyState>(empty);

export const PartyProvider : React.FC = ({ children }) => {
  const scenario = useScenario();
  const [partyIds, setPartyIds] = useState<any>({});
  const [partyNames, setPartyNames] = useState<any>({});
  const [partyTokens, setPartyTokens] = useState<any>({});

  useMemo(() => {
    const filtered = parties.filter(p => p.scenario === scenario.selected.label);
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
  const getNames = (ids : Set<string>) => (values(ids).map(id => partyNames[id]).join(", ") || "") as string;
  const getToken = (id : string) => (partyTokens[id] || "") as string;

  return (
    <PartyContext.Provider value={{ users: Object.keys(partyIds), getParty, getName, getNames, getToken }}>
        {children}
    </PartyContext.Provider>
  );
}

export const useParties = () => {
  return React.useContext(PartyContext);
}
