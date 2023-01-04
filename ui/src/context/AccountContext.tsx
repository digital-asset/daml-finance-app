// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty, useStreamQueries } from "@daml/react";
import { AccountKey, InstrumentKey } from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { AccountDirectory } from "@daml.js/daml-finance-app-data/lib/Daml/Finance/App/Data/AccountDirectory";

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

  const party = useParty();
  const { loading: l1, contracts: refs } =  useStreamQueries(Reference);
  const { loading: l2, contracts: directories } = useStreamQueries(AccountDirectory);
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
