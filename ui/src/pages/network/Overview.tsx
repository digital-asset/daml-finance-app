// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react";
import ReactFlow, { Background } from "react-flow-renderer";
import { FloatingEdge } from "../../components/Network/FloatingEdge";
import { Spinner } from "../../components/Spinner/Spinner";
import { useScenarios } from "../../context/ScenarioContext";
import { useNetwork } from "../../hooks/Network";

export const Overview : React.FC = () => {
  const { selected } = useScenarios();
  const network = useNetwork(selected);

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
  }), []);;

  if (network.loading) return <Spinner />;

  return (
    <ReactFlow
      nodes={network.nodes}
      edges={network.edges}
      onNodesChange={network.onNodesChange}
      onEdgesChange={network.onEdgesChange}
      fitView
      snapToGrid
      snapGrid={[20, 20]}
      nodesConnectable={false}
      nodesDraggable={true}
      panOnDrag={true}
      selectNodesOnDrag={true}
      edgeTypes={edgeTypes}
      style={{ height: "90%" }}>
      <Background gap={20}/>
    </ReactFlow>
  );
};

