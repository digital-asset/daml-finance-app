// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import partyList from "./parties.json";

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
