// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ReactDOM from "react-dom";
import { StyledEngineProvider } from "@mui/styled-engine";
import { BrandingProvider } from "./context/BrandingContext";
import { UserProvider } from "./context/UserContext";
import { PartyProvider } from "./context/PartiesContext";
import { ScenarioProvider } from "./context/ScenarioContext";
import { AdminProvider } from "./context/AdminContext";
import { Main } from "./Main";

ReactDOM.render((
  <BrandingProvider>
    <AdminProvider>
      <ScenarioProvider>
        <PartyProvider>
          <UserProvider>
            <StyledEngineProvider injectFirst>
              <Main />
            </StyledEngineProvider>
          </UserProvider>
        </PartyProvider>
      </ScenarioProvider>
    </AdminProvider>
  </BrandingProvider>
), document.getElementById("root"));
