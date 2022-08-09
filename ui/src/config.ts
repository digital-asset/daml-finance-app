// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import partyList from "./parties.json";

type Position = {
  x : number
  y : number
};

export type Scenario = {
  name : string,
  positions : Map<string, Position>
};

export const httpBaseUrl = undefined;
export const wsBaseUrl = "ws://localhost:7575/";

export const partyIds : any = {};
partyList.forEach(p => partyIds[p._1] = p._2);
export const partyNames : any = {};
partyList.forEach(p => partyNames[p._2] = p._1);

const createToken = (party : string) => {
  const payload = {
    ledgerId: "sandbox",
    applicationId: "daml-finance-app",
    admin: true,
    actAs: [party],
    readAs: [party, partyIds["Public"]]
  };
  return encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
};

export const partyTokens : any = {};
partyList.forEach(p => partyTokens[p._2] = createToken(p._2));

export const scenarios : Scenario[] = [
  {
    name: "Standard",
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:  200, y:   0 } ],
      [ "CentralBank",  { x:    0, y: 200 } ],
      [ "Registry",     { x:  400, y:   0 } ],
      [ "Exchange",     { x:  800, y:   0 } ],
      [ "Agent",        { x: 1200, y: 200 } ],
      [ "Issuer",       { x:    0, y: 400 } ],
      [ "Alice",        { x:  400, y: 600 } ],
      [ "Bob",          { x:  800, y: 600 } ],
      [ "Charlie",      { x: 1200, y: 400 } ]
    ])
  }
]