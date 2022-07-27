// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PaletteMode } from "@mui/material";
import damlLogin from "../images/daml-logo-mark-light.png";
import damlHeader from "../images/daml-logo-mark-light.png";

type Branding = {
  loginLogo : JSX.Element
  headerLogo : JSX.Element
  primary : string
  secondary : string
  mode : PaletteMode
  loginX : string
  loginY : string
}

const BrandingContext = React.createContext<Branding>({ loginLogo: <></>, headerLogo: <></>, primary: "#000", secondary: "#000", mode: "light", loginX: "50%", loginY: "80%" });

export const BrandingProvider : React.FC = ({ children }) => {
  return (
    <BrandingContext.Provider value={brands.daml}>
        {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  return React.useContext(BrandingContext);
}

const createDaml = () => {
  const loginLogo : JSX.Element = (
    <img alt="loginLogo" src={damlLogin} style={{
      position: "absolute",
      // objectFit: "fill",
      top: "30%",
      left: "50%",
      // width: "100%",
      // height: "100%",
      // minHeight: "100%",
      WebkitTransform: "translate(-50%, -50%)",
      transform: "translate(-50%, -50%)",
      display: "inline-block",
      zIndex: 0
    }} />);
  const headerLogo : JSX.Element = <img alt="headerLogo" src={damlHeader} height="56px" style={{ position: "absolute", top: 5, marginLeft: 80 }} />;
  const primary = "#4e7df9";
  const secondary = "#1f2937";
  const mode : PaletteMode = "light";
  const branding = { loginLogo, headerLogo, primary, secondary, mode, loginX: "44%", loginY: "70%" };
  return branding;
};

const brands = {
  daml: createDaml(),
}
