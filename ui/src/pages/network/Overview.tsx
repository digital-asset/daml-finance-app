import React, { useMemo } from "react";
import ReactFlow, { Background } from "react-flow-renderer";
import { FloatingEdge } from "../../components/Network/FloatingEdge";
import { Spinner } from "../../components/Spinner/Spinner";
import { useNetwork } from "../../hooks/Network";

export const Overview : React.FC = () => {
  const network = useNetwork();

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
  }), []);;

  if (network.loading) return (<Spinner />);

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
