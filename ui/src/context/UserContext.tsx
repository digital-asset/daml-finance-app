// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useAdmin } from "./AdminContext";
import { useParties } from "./PartiesContext";

type UserState = {
  loading : boolean
  loggedIn : boolean
  user : string
  party : string
  token : string
  login : (loginUser : string) => void
  logout : () => void
}

const defaultState : UserState = { loading: true, loggedIn: false, user: "", party: "", token: "", login: _ => null, logout: () => null };
const UserContext = React.createContext<UserState>(defaultState);

export const UserProvider : React.FC = ({ children }) => {
  const { loading: l1, getParty, getToken } = useParties();
  const { loading: l2, ledgerId } = useAdmin();
  const [state, setState] = useState<UserState>(defaultState);

  const login = (loginUser : string) => {
    if (l1 || l2) throw new Error("Trying to login while still loading");
    localStorage.setItem(ledgerId + ".user", loginUser);
    const loginParty = getParty(loginUser);
    const loginToken = getToken(loginParty)
    setState(s => ({ ...s, loggedIn: true, user: loginUser, party: loginParty, token: loginToken }));
  };

  const logout = () => {
    if (l1 || l2) throw new Error("Trying to logout while still loading");
    localStorage.removeItem(ledgerId + ".user");
    setState(s => ({ ...s, loggedIn: false, user: "", party: "", token: "" }));
  };

  useEffect(() => {
    if (l1 || l2) return;
    const key = ledgerId + ".user";
    const user = localStorage.getItem(key) || "";
    const party = getParty(user);
    const token = getToken(party)
    setState(s => ({ ...s, loading: false, loggedIn: !!user, user, party, token }))
  }, [l1, l2, ledgerId, getParty, getToken]);

  return (
    <UserContext.Provider value={{ ...state, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return React.useContext(UserContext);
};
