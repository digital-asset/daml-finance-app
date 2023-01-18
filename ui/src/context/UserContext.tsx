// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useAdmin } from "./AdminContext";
import { useParties } from "./PartiesContext";

type UserState = {
  isLoggedIn : boolean
  user : string
  party : string
  token : string
  login : (loginUser : string) => void
  logout : () => void
}

const UserContext = React.createContext<UserState>({ isLoggedIn: false, user: "", party: "", token: "", login: _ => null, logout: () => null });

export const UserProvider : React.FC = ({ children }) => {
  const { getParty, getToken } = useParties();
  const { ledgerId } = useAdmin();
  const key = ledgerId + ".user";
  const storedUser = localStorage.getItem(key) || "";
  const storedParty = getParty(storedUser);
  const storedToken = getToken(storedParty)

  const [user, setUser] = useState(storedUser);
  const [party, setParty] = useState(storedParty);
  const [token, setToken] = useState(storedToken);

  const login = (loginUser : string) => {
    localStorage.setItem(key, loginUser);
    const loginParty = getParty(loginUser);
    const loginToken = getToken(loginParty)
    setUser(loginUser);
    setParty(loginParty);
    setToken(loginToken);
  };

  const logout = () => {
    localStorage.removeItem(key);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn: !!token, user, party, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return React.useContext(UserContext);
};
