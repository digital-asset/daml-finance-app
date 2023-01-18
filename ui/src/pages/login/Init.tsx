// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { LinearProgress, Typography } from "@mui/material";
import { useScenario } from "../../context/ScenarioContext";
import { useBranding } from "../../context/BrandingContext";
import { useNavigate } from "react-router-dom";
import { PartyInfo, useAdmin } from "../../context/AdminContext";
import useStyles from "./styles";

export const Init : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const branding = useBranding();
  const admin = useAdmin();
  const { scenarios, initialize } = useScenario();

  const [ scenario, setScenario ] = useState("Default");
  const [ progress, setProgress ] = useState(0);

  // useEffect(() => {
  //   if (!admin.ledgerId) return;
  //   const initParties = async () => {
  //     const key = admin.ledgerId + ".partyInfo";
  //     const partyInfoString = localStorage.getItem(key);
  //     if (!partyInfoString) {
  //       if (admin.parties.length > 1) throw new Error("No parties found in local storage, but ledger has some");
  //       console.log("No parties found for ledger id [" + admin.ledgerId + "]. Initializing parties...");
  //       const partyInfos : PartyInfo[] = [];
  //       for (var i = 0; i < scenarios.length; i++) {
  //         const s = scenarios[i];
  //         setScenario(s.label);
  //       };
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
      <Typography variant="h6" className={cls.subHeader}>Initializing scenario [{scenario}]...</Typography>
      <LinearProgress variant="determinate" value={progress} className={cls.progressBar} />
    </>
  );
}
