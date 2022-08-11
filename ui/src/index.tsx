// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ReactDOM from "react-dom";
import { StyledEngineProvider } from "@mui/styled-engine";
import { BrandingProvider } from "./context/BrandingContext";
import { UserProvider } from "./context/UserContext";
import { PartiesProvider } from "./context/PartiesContext";
import { Main } from "./Main";
import { ScenarioProvider } from "./context/ScenarioContext";

ReactDOM.render((
  <BrandingProvider>
    <ScenarioProvider>
      <PartiesProvider>
        <UserProvider>
          <StyledEngineProvider injectFirst>
            <Main />
          </StyledEngineProvider>
        </UserProvider>
      </PartiesProvider>
    </ScenarioProvider>
  </BrandingProvider>
), document.getElementById("root"));
