// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { NavigateFunction } from "react-router-dom";
import { useParties } from "./PartiesContext";

const UserStateContext = React.createContext<UserState>({ isAuthenticated: false, name: "", party: "", token: "" });
const UserDispatchContext = React.createContext<React.Dispatch<any>>({} as React.Dispatch<any>);

type UserState = {
  isAuthenticated : boolean
  name : string
  party : string
  token : string
}

const userReducer = (state : UserState, action : any) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, name: action.name, party: action.party, token: action.token };
    case "LOGIN_FAILURE":
      return { ...state, isAuthenticated: false };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const UserProvider : React.FC = ({ children }) => {
  const name = localStorage.getItem("daml.name") || "";
  const { getParty, getToken } = useParties();

  const party = getParty(name);
  const token = getToken(party);

  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!token,
    name: name || "",
    party: party || "",
    token: token || ""
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

const useUserState = () => {
  var context = React.useContext<UserState>(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

const useUserDispatch = () => {
  var context = React.useContext<React.Dispatch<any>>(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

// ###########################################################

const loginUser = async (
    dispatch : React.Dispatch<any>,
    name : string,
    party : string,
    token : string,
    navigate : NavigateFunction,
    setError : React.Dispatch<React.SetStateAction<boolean>>) => {
  setError(false);

  if (!!name) {

    localStorage.setItem("daml.name", name);

    dispatch({ type: "LOGIN_SUCCESS", name, party, token });
    setError(false);
    navigate("/app");
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
  }
}

const signOut = (dispatch : React.Dispatch<any>) => {
  // event.preventDefault();
  localStorage.removeItem("daml.name");

  dispatch({ type: "SIGN_OUT_SUCCESS" });
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut };
