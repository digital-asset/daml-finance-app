import React from "react";
import ReactFlow, { Background, Controls, MiniMap } from "react-flow-renderer";
import { Spinner } from "../../components/Spinner/Spinner";
import { useNetwork } from "../../hooks/Network";
import { useScenario } from "../../hooks/Scenario";

export const Overview : React.FC = () => {
  const scenario = useScenario();
  const network = useNetwork(scenario.selected);
  if (network.loading) return (<Spinner />);

  return (
    <ReactFlow nodes={network.nodes} edges={network.edges} onNodesChange={network.onNodesChange} onEdgesChange={network.onEdgesChange} fitView snapToGrid snapGrid={[20, 20]} style={{ height: "90%" }} nodesConnectable={false} >
      <MiniMap style={{ backgroundColor: "#ccc" }} />
      <Controls showZoom={false} showInteractive={false} />
      <Background gap={20}/>
    </ReactFlow>
  );
};
