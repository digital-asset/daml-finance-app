// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0


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

export const scenarios : Scenario[] = [
  {
    name: "Default",
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
    ])
  },
  {
    name: "Structured Notes",
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
    ])
  },
  {
    name: "Natural Gas",
    positions: new Map([
      [ "Operator",     { x:    0, y:   0 } ],
      [ "Public",       { x:    0, y:   0 } ],
      [ "CentralBank",  { x:  200, y:   0 } ],
      [ "Seller",       { x:  400, y: 200 } ],
      [ "Buyer",        { x:    0, y: 400 } ]
    ])
  }
];
