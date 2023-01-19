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
};

const defaultState : AdminState = {
  loading: true,
  ledgerId: "",
  ledgerParties: [],
  createParty: (a, b) => { throw new Error("Not implemented") },
  getMultiPartyToken: (parties) => { throw new Error("Not implemented") }
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

  useMemo(() => {
    const initialize = async () => {
      const payload = { ledgerId: "sandbox", applicationId: "daml-finance-app", admin: true };
      const token = encode({ "https://daml.com/ledger-api": payload }, "secret", "HS256");
      const config = { headers: { "Authorization": "Bearer " + token } };
      const { data } = await axios.get("/v1/parties", config);
      const ledgerParties : PartyInfo[] = data.result;
      const sandboxParty = ledgerParties.find(p => p.identifier.startsWith("sandbox::"));
      if (!sandboxParty) throw new Error("Couldn't find sandbox party");
      const ledgerId = sandboxParty.identifier.split("::")[1];
      console.log("LedgerId: " + ledgerId);
      console.log("Parties: " + ledgerParties.length);
      setState(s => ({ ...s, loading: false, ledgerId, ledgerParties }));
    };
    initialize();
  }, []);

  return (
    <AdminContext.Provider value={{ ...state, createParty, getMultiPartyToken }}>
        {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  return React.useContext(AdminContext);
}
