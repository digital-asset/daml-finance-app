// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ThemeOptions } from "@mui/material";
import damlLogoLight from "../images/daml-logo-mark-light.svg";
// import damlLogoDark from "../images/daml-logo-mark-dark.svg";
import daLogoLight from "../images/digital-asset-logo-light.svg";
import daLogoDark from "../images/digital-asset-logo-dark.svg";
import backgroundImage from "../images/background.png";

type Branding = {
  background : JSX.Element
  loginLogo : JSX.Element
  headerLogo : JSX.Element
  loginX : string
  loginY : string
  options : ThemeOptions
}

const light : Branding = {
  background: <></>,
  loginLogo: <img src={damlLogoLight} style={{ position: "absolute", top: "30%", left: "50%", WebkitTransform: "translate(-50%, -50%)", transform: "translate(-50%, -50%)", display: "inline-block", zIndex: 0 }} />,
  headerLogo: <img src={daLogoLight} height="28px" style={{ position: "absolute", top: 20, marginLeft: 5 }} />,
  loginX: "50%",
  loginY: "80%",
  options: {
    palette: {
      mode: "light",
      primary: { main: "#4f80f7" }, // #00345f #4e7df9 #5c86df
      secondary: { main: "#002856" }, // #3a478f
      background: {
        default: "#f5f5f5",
        paper: "#fff"
      }
    },
    typography: {
      allVariants: {
        fontFamily: "'Roboto', sans-serif;",
    }
    },
    components: {
      MuiTextField: {
        defaultProps: {
          variant: "standard",
        }
      },
      MuiSelect: {
        defaultProps: {
          variant: "standard",
        },
      }
    },
  },
};
const BrandingContext = React.createContext<Branding>(light);

export const BrandingProvider : React.FC = ({ children }) => {
  return (
    <BrandingContext.Provider value={dark}>
        {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  return React.useContext(BrandingContext);
}

const dark : Branding = {
  ...light,
  background: <img src={backgroundImage} style={{ position: "absolute", objectFit: "fill", top: "50%", left: "50%", width: "100%", height: "100%", minHeight: "100%", WebkitTransform: "translate(-50%, -50%)", transform: "translate(-50%, -50%)", display: "inline-block", zIndex: 0 }} />,
  loginLogo: <img alt="loginLogo" src={damlLogoLight} style={{ position: "absolute", top: "12%", left: "50%", WebkitTransform: "translate(-50%, 0%)", transform: "translate(-50%, 0%)", display: "inline-block", zIndex: 0 }} />,
  headerLogo: <img alt="headerLogo" src={daLogoDark} height="28px" style={{ position: "absolute", top: 20, marginLeft: 5 }} />,
  options: {
    ...light.options,
    palette: {
      mode: "dark",
      primary: { main: "#4f80f7" }, // #a6f6ff #00345f #002856 #6575f1
      secondary: { main: "#002856" }, // #6575f1
      background: {
        paper: "#1e1e1e"
      },
      text: {
        primary: "#ccc",
        // secondary: "#adadad"
      },
    }
  }
};
