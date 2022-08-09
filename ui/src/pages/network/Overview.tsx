import React from "react";
import ReactFlow, { Background, Controls, MiniMap } from "react-flow-renderer";
import { Spinner } from "../../components/Spinner/Spinner";
import { scenarios } from "../../config";
import { useNetwork } from "../../hooks/Network";

export const Overview : React.FC = () => {

  const scenario = scenarios[0];
  const network = useNetwork(scenario);
  if (network.loading) return (<Spinner />);

  return (
    <ReactFlow nodes={network.nodes} edges={network.edges} onNodesChange={network.onNodesChange} onEdgesChange={network.onEdgesChange} fitView snapToGrid snapGrid={[20, 20]} style={{ height: "90%" }} nodesConnectable={false} >
      <MiniMap style={{ backgroundColor: "#ccc" }} />
      <Controls showZoom={false} showInteractive={false} />
      <Background gap={20}/>
    </ReactFlow>
  );
};
