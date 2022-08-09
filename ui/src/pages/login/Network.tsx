// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import ReactFlow from "react-flow-renderer";
import { Typography } from "@mui/material";
import useStyles from "./styles";
import { useBranding } from "../../context/BrandingContext";
import { Box } from "@mui/system";
import { useNetwork } from "../../hooks/Network";
import { Spinner } from "../../components/Spinner/Spinner";
import damlLogin from "../../images/daml-logo-mark-light.png";
import { scenarios } from "../../config";

export const Network : React.FC = () => {
  const classes = useStyles();
  const branding = useBranding();

  const scenario = scenarios[0];
  const network = useNetwork(scenario);
  if (network.loading) return (<Spinner />);

  return (
    <>
      <img alt="loginLogo" src={damlLogin} style={{ position: "absolute", top: "10%", left: "50%", transform: "translate(-50%, 0%)", display: "inline-block", zIndex: 0 }} />
      <Typography variant="h2" style={{ textAlign: "center" }}>Digital Market Infrastructure</Typography>
      <Box className={classes.loginContainer} style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, 0%)", width: "800px", height: "600px", backgroundColor: "red" }}>
        <ReactFlow nodes={network.nodes} edges={network.edges} onNodesChange={network.onNodesChange} onEdgesChange={network.onEdgesChange} fitView snapToGrid snapGrid={[20, 20]} nodesConnectable={false} />
      </Box>
    </>
  );
}
