// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from "react";
import axios from "axios";
import { encode } from "jwt-simple";

export type PartyInfo = {
  displayName : string
  identifier : string
  isLocal : boolean
  scenario : string
};

type AdminState = {
  loading : boolean
  ledgerId : string
  ledgerParties : PartyInfo[]
  createParty : (displayName : string, identifierHint: string) => Promise<PartyInfo>
  getMultiPartyToken : (parties : string[]) => Promise<string>
  runSetup : (templateId : string, choice : string, parties : string[]) => Promise<void>
};

const defaultState : AdminState = {
  loading: true,
  ledgerId: "",
  ledgerParties: [],
  createParty: (a, b) => { throw new Error("Not implemented") },
  getMultiPartyToken: (parties) => { throw new Error("Not implemented") },
  runSetup: (templateId, choice, parties) => { throw new Error("Not implemented") }
};
const AdminContext = React.createContext<AdminState>(defaultState);

export const AdminProvider : React.FC = ({ children }) => {
  const [state, setState] = useState<AdminState>(defaultState);

  const createParty = async (displayName: string, identifierHint: string) => {
    const payload = { ledgerId: "sandbox", applicationId: "daml-finance-app", admin: true };
    const token = encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
    const config = { headers: { "Authorization": "Bearer " + token } };
    const body = { identifierHint, displayName };
    const { data } = await axios.post("/v1/parties/allocate", body, config);
    return data.result as PartyInfo;
  };

  const getMultiPartyToken = (parties: string[]) => {
    const payload = { ledgerId: "sandbox", applicationId: "daml-finance-app", admin: true, actAs: parties };
    const token = encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
    return Promise.resolve(token);
  };

  const runSetup = async (templateId : string, choice : string, parties: string[]) => {
    const token = await getMultiPartyToken(parties);
    const config = { headers: { "Authorization": "Bearer " + token } };
    const body = {
      templateId,
      payload: { parties },
      choice: choice,
      argument: {}
    }
    await axios.post("/v1/create-and-exercise", body, config);
  };

  const initialize = async () => {
    const payload = { ledgerId: "sandbox", applicationId: "daml-finance-app", admin: true };
    const token = encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
    const config = { headers: { "Authorization": "Bearer " + token } };
    const { data } = await axios.get("/v1/parties", config);
    const ledgerParties : PartyInfo[] = data.result;
    const sandboxParty = ledgerParties.find(p => p.identifier.startsWith("sandbox::"));
    if (!sandboxParty) throw new Error("Couldn't find sandbox party");
    const participantId = sandboxParty.identifier.split("::")[1];
    console.log("LedgerId: " + participantId);
    console.log("Parties: " + ledgerParties.length);
    setState(s => ({ ...s, loading: false, ledgerId: participantId, ledgerParties }));
  };

  useMemo(() => {
    initialize();
  }, []);

  return (
    <AdminContext.Provider value={{ ...state, createParty, getMultiPartyToken, runSetup }}>
        {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  return React.useContext(AdminContext);
}
