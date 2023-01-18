// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { Edge, EdgeChange, MarkerType, Node, NodeChange, useEdgesState, useNodesState } from "react-flow-renderer";
import { useParties } from "../context/PartiesContext";
import { useScenario } from "../context/ScenarioContext";
import { ServiceAggregate, useServices } from "../context/ServicesContext";
import { dedup } from "../util";

export type Network = {
  nodes : Node<any>[],
  setNodes : React.Dispatch<React.SetStateAction<Node<any>[]>>,
  onNodesChange : (changes: NodeChange[]) => void
  edges : Edge<any>[],
  setEdges : React.Dispatch<React.SetStateAction<Edge<any>[]>>,
  onEdgesChange : (changes: EdgeChange[]) => void,
  loading : boolean
}

type GroupedServices = {
  id : string
  provider : string
  customer : string
  services : string[]
};

export const useNetwork = () : Network => {

  const { getName } = useParties();
  const scenario = useScenario();
  const svc = useServices();
  const services : ServiceAggregate<any>[] = Array.prototype.concat.apply([], [
    svc.auction.services,
    svc.backToBack.services,
    svc.bidding.services,
    svc.custody.services,
    svc.fund.services,
    svc.investment.services,
    svc.issuance.services,
    svc.lending.services,
    svc.lifecycle.services,
    svc.listing.services,
    svc.settlement.services,
    svc.structuring.services,
    svc.subscription.services,
    svc.trading.services,
  ]);

  const createNode = (p : string, i : number) => ({
      id: p,
      data: { label: getName(p) },
      position: scenario.selected.parties.find(pi => pi.party.displayName === getName(p))?.position || { x: 0, y: 0 },
      style: { zIndex: 0, width: 160, cursor: "pointer" },
      zIndex: 0
  });

  const createEdge = (c : GroupedServices) : Edge => ({
    id: c.id,
    source: c.provider,
    target: c.customer,
    label: (<>{c.services.map((s, i) => (<tspan key={i} x={0} y={6 + i * 15}>{s}</tspan>))}</>),
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: c.provider === c.customer ? { fill: "#FFCC00", color: "#fff", fillOpacity: 0.7, transform: "translate(150px)" } : { fill: "#FFCC00", color: "#fff", fillOpacity: 0.7 },
    labelStyle: c.provider === c.customer ? { transform: "translate(150px)" } : {},
    zIndex: 1,
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      strokeWidth: 3,
      color: "#666"
    },
    // animated: true
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!svc.loading) {
      const groupedServices : GroupedServices[] = [];
      const getName = (s : ServiceAggregate<any>) => s.service.templateId.split(":")[1].replace("Daml.Finance.App.Interface.", "");
      services.forEach(c => {
        const elem = groupedServices.find(e => e.provider === c.payload.provider && e.customer === c.payload.customer);
        if (!!elem) elem.services.push(getName(c));
        else groupedServices.push({ id: c.contractId, provider: c.payload.provider, customer: c.payload.customer, services: [getName(c)]});
      });
      const parties = dedup(groupedServices.flatMap(s => [s.provider, s.customer]));
      setNodes(parties.map(createNode));
      setEdges(groupedServices.map(createEdge));
      setLoading(false);
    };
  }, [scenario, setNodes, setEdges, setLoading, svc.loading]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, loading };
};
