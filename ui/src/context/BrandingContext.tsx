// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ThemeOptions } from "@mui/material";
import damlLogoLight from "../images/daml-logo-light.svg";
import damlLogoDark from "../images/daml-logo-dark.svg";
import backgroundImage from "../images/background.png";

declare module '@mui/material/styles' {
  interface Theme {
    colors: {
      header: string;
      headerText: string;
      claims1: string;
      claims2: string;
      claims3: string;
    };
  }
  interface ThemeOptions {
    colors?: {
      header?: string;
      headerText?: string;
      claims1?: string;
      claims2?: string;
      claims3?: string;
    };
  }
}

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
  loginLogo: <img alt="" src={damlLogoLight} style={{ position: "absolute", top: "30%", left: "50%", WebkitTransform: "translate(-50%, -50%)", transform: "translate(-50%, -50%)", display: "inline-block", zIndex: 0 }} />,
  headerLogo: <img alt="" src={damlLogoLight} height="28px" style={{ position: "absolute", top: 20, marginLeft: 5 }} />,
  loginX: "50%",
  loginY: "80%",
  options: {
    colors: {
      header: "#FFFFFF",
      headerText: "#22252A",
      claims1: "",
      claims2: "",
      claims3: ""
    },
    palette: {
      mode: "light",
      primary: { main: "#4f80f7" }, // #00345f #4e7df9 #5c86df
      secondary: { main: "#002856" }, // #3a478f
      background: {
        default: "#FAFAFA",
        paper: "#F1F2F4"
      }
    },
    typography: {
      allVariants: {
        fontFamily: "'Lato', sans-serif;",
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

const dark : Branding = {
  ...light,
  background: <img alt="" src={backgroundImage} style={{ position: "absolute", objectFit: "fill", top: "50%", left: "50%", width: "100%", height: "100%", minHeight: "100%", WebkitTransform: "translate(-50%, -50%)", transform: "translate(-50%, -50%)", display: "inline-block", zIndex: 0 }} />,
  loginLogo: <img alt="" src={damlLogoDark} style={{ position: "absolute", top: "12%", left: "50%", WebkitTransform: "translate(-50%, 0%)", transform: "translate(-50%, 0%)", display: "inline-block", zIndex: 0 }} />,
  headerLogo: <img alt="" src={damlLogoDark} height="26px" style={{ position: "absolute", top: 21, marginLeft: 29 }} />,
  options: {
    ...light.options,
    colors: {
      header: "#29384C",
      headerText: "#A7F6FF",
      claims1: "",
      claims2: "",
      claims3: ""
    },
    palette: {
      mode: "dark",
      primary: { main: "#A7F6FF" }, // #a6f6ff #00345f #002856 #6575f1
      secondary: { main: "#002856" }, // #6575f1
      background: {
        default: "#232F40",
        paper: "#364963"
      },
      text: {
        primary: "#FFFFFF",
        secondary: "#22252A"
      },
    }
  }
};

const themes = { light, dark };

const BrandingContext = React.createContext<Branding>(themes.light);

export const BrandingProvider : React.FC = ({ children }) => {
  return (
    <BrandingContext.Provider value={themes.dark}>
        {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  return React.useContext(BrandingContext);
}
