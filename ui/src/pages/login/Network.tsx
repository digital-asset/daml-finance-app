// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from "react";
import ReactFlow, { Background, Node } from "react-flow-renderer";
import { Typography } from "@mui/material";
import useStyles from "./styles";
import { Box } from "@mui/system";
import { useNetwork } from "../../hooks/Network";
import { Spinner } from "../../components/Spinner/Spinner";
import damlLogin from "../../images/daml-logo-mark-light.png";
import { loginUser, useUserDispatch } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FloatingEdge } from "../../components/Network/FloatingEdge";
import "./index.css"
import { useScenario } from "../../hooks/Scenario";
import { useParties } from "../../hooks/Parties";

export const Network : React.FC = () => {
  const classes = useStyles();
  const userDispatch = useUserDispatch();
  const navigate = useNavigate();
  const [, setError] = useState(false);
  const { getParty, getToken } = useParties();
  const scenario = useScenario();
  const network = useNetwork(scenario.selected);

  const onNodeClick = async (event: any, node: Node) => {
    await loginUser(userDispatch, node.data.label, getParty(node.data.label), getToken(node.data.label), navigate, setError);
  };

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
  }), []);;

  if (network.loading) return (<Spinner />);

  return (
    <>
      <img alt="loginLogo" src={damlLogin} style={{ position: "absolute", top: "10%", left: "50%", transform: "translate(-50%, 0%)", display: "inline-block", zIndex: 0 }} />
      <Typography variant="h2" style={{ textAlign: "center" }}>Digital Market Infrastructure</Typography>
      <Box className={classes.loginContainer} style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px", backgroundColor: "#f5f5f5" }} border={1} borderColor="primary.main">
        <ReactFlow
          nodes={network.nodes}
          edges={network.edges}
          onNodesChange={network.onNodesChange}
          onEdgesChange={network.onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          nodesConnectable={false}
          nodesDraggable={true}
          panOnDrag={true}
          selectNodesOnDrag={true}
          edgeTypes={edgeTypes}>
          <Background />
        </ReactFlow>
      </Box>
    </>
  );
}
