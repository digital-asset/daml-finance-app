// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { encode } from "jwt-simple";
import { useScenarios } from "./ScenarioContext";
import { Set } from "@daml.js/97b883cd8a2b7f49f90d5d39c981cf6e110cf1f1c64427a28a6d58ec88c43657/lib/DA/Set/Types"
import { values } from "../util";
import { PartyInfo } from "./AdminContext";

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
  loading : boolean
  names : string[]
  parties : string[]
  getParty : (name : string) => string,
  getName : (id : string) => string,
  getNames : (ids : Set<string>) => string,
  getToken : (id : string) => string,
}

const defaultState = {
  loading: true,
  names: [],
  parties: [],
  getParty: (name : string) => "",
  getName: (id : string) => "",
  getNames: (ids : Set<string>) => "",
  getToken: (id : string) => ""
};
const PartyContext = React.createContext<PartyState>(defaultState);

export const PartyProvider : React.FC = ({ children }) => {
  const { loading, selected } = useScenarios();
  const [state, setState] = useState<PartyState>(defaultState);

  useEffect(() => {
    if (loading) return;
    const partyInfos : PartyInfo[] = selected.parties.map(p => p.party);
    const names = selected.parties.map(p => p.party.displayName);
    const parties = selected.parties.map(p => p.party.identifier);
    const pIds : any = {};
    const pNames : any = {};
    const pTokens : any = {};
    partyInfos.forEach(p => pIds[p.displayName] = p.identifier);
    partyInfos.forEach(p => pNames[p.identifier] = p.displayName);
    partyInfos.forEach(p => pTokens[p.identifier] = createToken(p.identifier, pIds["Public"]));
    const getParty = (name : string) => (pIds[name] || "") as string;
    const getName = (id : string) => (pNames[id] || "") as string;
    const getNames = (ids : Set<string>) => (values(ids).map(id => pNames[id]).join(", ") || "") as string;
    const getToken = (id : string) => (pTokens[id] || "") as string;
    setState({ loading: false, names, parties, getParty, getName, getNames, getToken });
  }, [loading, selected]);

  return (
    <PartyContext.Provider value={state}>
        {children}
    </PartyContext.Provider>
  );
}

export const useParties = () => {
  return React.useContext(PartyContext);
}
