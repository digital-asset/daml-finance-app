// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from "react";
import ReactFlow, { Background, Node } from "react-flow-renderer";
import { IconButton, Typography } from "@mui/material";
import useStyles from "./styles";
import { Box } from "@mui/system";
import { useNetwork } from "../../hooks/Network";
import { Spinner } from "../../components/Spinner/Spinner";
import damlLogin from "../../images/daml-logo-mark-light.svg";
import { loginUser, useUserDispatch } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FloatingEdge } from "../../components/Network/FloatingEdge";
import { useParties } from "../../context/PartiesContext";
import ExitToApp from "@mui/icons-material/ExitToApp";
import "./index.css"
import { useBranding } from "../../context/BrandingContext";

export const Network : React.FC = () => {
  const classes = useStyles();
  const branding = useBranding();
  const userDispatch = useUserDispatch();
  const navigate = useNavigate();
  const [, setError] = useState(false);
  const { getParty, getToken } = useParties();
  const network = useNetwork();

  const onNodeClick = async (event: any, node: Node) => {
    const party = getParty(node.data.label);
    const token = getToken(party);
    await loginUser(userDispatch, node.data.label, party, token, navigate, setError);
  };

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
  }), []);;

  if (network.loading) return <Spinner />;

  return (
    <>
      {branding.background}
      {/* {branding.loginLogo} */}
      <Typography variant="h1" style={{ textAlign: "center", position: "absolute", top: "5%", left: "50%", transform: "translate(-50%, 0%)" }}>Daml Finance</Typography>
      <Typography variant="h6" style={{ textAlign: "center", position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, 0%)" }}>Select a party to login</Typography>
      <Box className={classes.loginContainer} border={1} borderColor="lightgrey" style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%, 0%)", width: "1600px", height: "600px" }} >
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
          nodesDraggable={false}
          panOnDrag={false}
          selectNodesOnDrag={false}
          zoomOnScroll={false}
          edgeTypes={edgeTypes}>
        </ReactFlow>
      </Box>
      <IconButton size="large" color="inherit" onClick={() => navigate("/login")} style={{ position: "absolute", top: "1%", left: "98%", transform: "translate(-50%, 0%)" }}>
        <ExitToApp fontSize="large" />
      </IconButton>
    </>
  );
}
