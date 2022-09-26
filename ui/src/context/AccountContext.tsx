// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty, useQuery } from "@daml/react";
import { AccountKey, InstrumentKey } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Common";
import { Reference } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Account";
import { AccountDirectory } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Data/AccountDirectory";
import { Account } from "@daml.js/daml-finance-holding/lib/Daml/Finance/Holding/Account";
import { Instruction } from "@daml.js/daml-finance-settlement/lib/Daml/Finance/Settlement/Instruction";

export type AccountState = {
  loading : boolean
  accounts : readonly AccountKey[]
  getAccount : (instrument : InstrumentKey) => AccountKey
};

const empty = {
  loading: true,
  accounts: [],
  getAccount: (instrument : InstrumentKey) => { throw new Error("Not implemented"); }
};

const AccountContext = React.createContext<AccountState>(empty);

export const AccountProvider : React.FC = ({ children }) => {

  useQuery(Account);
  useQuery(Instruction);

  const party = useParty();
  const { loading: l1, contracts: refs } =  useQuery(Reference);
  const { loading: l2, contracts: directories } = useQuery(AccountDirectory);
  const loading = l1 || l2;
  const directory = directories.find(c => c.payload.provider === party);
  const accounts = refs.map(c => c.key);

  const getAccount = (instrument : InstrumentKey) => {
    if (!directory) throw new Error("No account directory found");
    const account = directory.payload.accounts.get(instrument.id);
    if (!account) throw new Error("No account found for instrument [" + instrument.id.unpack + "]")
    return account;
  }

  const value = {
    loading,
    accounts,
    getAccount
  };

  return (
    <AccountContext.Provider value={value}>
        {children}
    </AccountContext.Provider>
  );
}

export const useAccounts = () => {
  return React.useContext(AccountContext);
}
