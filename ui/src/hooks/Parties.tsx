// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import parties from "../parties.json";
import { useScenario } from "./Scenario";

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

export type Control = {
  getParty : (name : string) => string,
  getName : (id : string) => string,
  getToken : (id : string) => string,
}

export const useParties = () : Control => {

  const scenario = useScenario();
  const filtered = parties.filter(p => p.scenario === scenario.selected.name);
  const partyIds : any = {};
  filtered.forEach((p : any) => partyIds[p.name] = p.id);
  const partyNames : any = {};
  filtered.forEach((p : any) => partyNames[p.id] = p.name);
  const partyTokens : any = {};
  filtered.forEach(p => partyTokens[p.id] = createToken(p.id, partyIds["Public"]));

  return {
    getParty: (name : string) => (partyIds[name] || "") as string,
    getName: (id : string) => (partyNames[id] || "") as string,
    getToken: (id : string) => (partyTokens[id] || "") as string,
  }
};
