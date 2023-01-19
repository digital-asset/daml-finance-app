// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo } from "react";
import ReactFlow, { Node } from "react-flow-renderer";
import { IconButton, Typography } from "@mui/material";
import useStyles from "./styles";
import { Box } from "@mui/system";
import { useNetwork } from "../../hooks/Network";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FloatingEdge } from "../../components/Network/FloatingEdge";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useBranding } from "../../context/BrandingContext";
import { useScenarios } from "../../context/ScenarioContext";
import { useLedger, useStreamQueries } from "@daml/react";
import { Scenario } from "@daml.js/daml-finance-app-setup/lib/Daml/Finance/App/Setup/Scenario/Default";
import { Spinner } from "../../components/Spinner/Spinner";
import "./index.css"

export const Network : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const branding = useBranding();
  const ledger = useLedger();
  const { loading: l1, login } = useUser();
  const { loading: l2, selected } = useScenarios();
  const { loading: l3, contracts } = useStreamQueries(Scenario);
  const { loading: l4, nodes, edges } = useNetwork(selected);
  const loading = l1 || l2 || l3 || l4;
  const scenarioExists = contracts.length > 0;

  const onNodeClick = async (event: any, node: Node) => {
    const user = node.data.label;
    login(user);
    navigate("/app");
  };

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
  }), []);

  useEffect(() => {
    const setup = async () => {
      console.log("Setting up scenario...");
      const parties = selected.parties.map(p => p.party.identifier);
      await ledger.createAndExercise(Scenario.Setup, { parties }, {});
      console.log("Scenario set up.");
    };
    if (!loading && !scenarioExists) setup();
  }, [ledger, selected, loading, scenarioExists ]);

  return (
    <>
      {branding.background}
      <Typography variant="h1" style={{ textAlign: "center", position: "absolute", top: "5%", left: "50%", transform: "translate(-50%, 0%)" }}>Daml Finance</Typography>
      <Typography variant="h6" style={{ textAlign: "center", position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, 0%)" }}>Select a party to login</Typography>
      <Box className={cls.loginContainer} border={1} borderColor="lightgrey" style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px" }} >
        {(loading || !scenarioExists) && <Spinner marginTop={250} />}
        {!loading && scenarioExists &&
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            nodesConnectable={false}
            nodesDraggable={false}
            panOnDrag={false}
            selectNodesOnDrag={false}
            zoomOnScroll={false}
            edgeTypes={edgeTypes}>
          </ReactFlow>}
      </Box>
      <IconButton size="large" color="inherit" onClick={() => navigate("/login/portal")} style={{ position: "absolute", top: "1%", left: "98%", transform: "translate(-50%, 0%)" }}>
        <ExitToApp fontSize="large" />
      </IconButton>
    </>
  );
}
