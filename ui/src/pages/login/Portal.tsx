// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Scenario } from "../../components/Card/Scenario";
import { useScenario } from "../../context/ScenarioContext";
import { useBranding } from "../../context/BrandingContext";
import useStyles from "./styles";
import { useAdmin } from "../../context/AdminContext";

export const Portal : React.FC = () => {
  const cls = useStyles();
  const branding = useBranding();
  // const { ledgerId, parties } = useAdmin();
  const { scenarios } = useScenario();
  // useEffect(() => {
  //   if (!ledgerId) return;
  //   const initParties = async () => {
  //     const key = ledgerId + ".scenarios";
  //     const partyInfoString = localStorage.getItem(key);
  //     if (!partyInfoString) {
  //       if (parties.length > 1) throw new Error("No parties found in local storage, but ledger has some");
  //       console.log("No parties found for ledger id [" + admin.ledgerId + "]. Initializing parties...");
  //       localStorage.setItem(key, JSON.stringify(partyInfos));
  //       setParties(partyInfos);
  //     } else {
  //       if (admin.parties.length === 1) throw new Error("Parties found in local storage, but ledger has none");
  //       console.log("Parties found for ledger id [" + admin.ledgerId + "]. Retrieving parties...");
  //       setParties(JSON.parse(partyInfoString));
  //     };
  //     navigate("/login/portal");
  //   };
  //   initParties();
  // }, [admin, setParties, scenarios, navigate]);

  return (
    <>
      {branding.background}
      <Typography variant="h1" className={cls.header}>Daml Finance</Typography>
      <Typography variant="h6" className={cls.subHeader}>Select a scenario to start</Typography>
      <Box className={cls.loginContainer} style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px" }}>
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12}>
            {scenarios.map((s, i) => (<Scenario key={i} scenario={s}/>))}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
