// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStreamQueries } from "@daml/react";
import { Service as BackToBackService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service"
import { Service as CustodyService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Custody/Service"
import { Service as AuctionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service"
// import { Service as AuctionAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Auto/Service"
import { Service as BiddingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Service"
// import { Service as BiddingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Auto/Service"
import { Service as SubscriptionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Service"
import { Service as IssuanceService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service"
// import { Service as IssuanceAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service"
import { Service as LifecycleService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service"
import { Service as ListingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service"
// import { Service as ListingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service"
import { Service as TradingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Service"
// import { Service as TradingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Auto/Service"
import { CreateEvent } from "@daml/ledger";
import { dedup } from "../util";
import { Edge, EdgeChange, MarkerType, Node, NodeChange, useEdgesState, useNodesState } from "react-flow-renderer";
import { useEffect, useState } from "react";
import { useParties } from "../context/PartiesContext";
import { useScenario } from "../context/ScenarioContext";

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
  const { contracts: backToBackServices,   loading: l1 } =  useStreamQueries(BackToBackService);
  const { contracts: custodyServices,      loading: l2 } =  useStreamQueries(CustodyService);
  const { contracts: auctionServices,      loading: l3 } =  useStreamQueries(AuctionService);
  const { contracts: biddingServices,      loading: l4 } =  useStreamQueries(BiddingService);
  const { contracts: subscriptionServices, loading: l5 } =  useStreamQueries(SubscriptionService);
  const { contracts: issuanceServices,     loading: l6 } =  useStreamQueries(IssuanceService);
  const { contracts: lifecycleServices,    loading: l7 } = useStreamQueries(LifecycleService);
  const { contracts: listingServices,      loading: l8 } = useStreamQueries(ListingService);
  const { contracts: tradingServices,      loading: l9 } = useStreamQueries(TradingService);
  // const { contracts: auctionAutoServices,  loading: l10 } =  useStreamQueries(AuctionAutoService);
  // const { contracts: biddingAutoServices,  loading: l11 } =  useStreamQueries(BiddingAutoService);
  // const { contracts: issuanceAutoServices, loading: l12 } =  useStreamQueries(IssuanceAutoService);
  // const { contracts: listingAutoServices,  loading: l13 } = useStreamQueries(ListingAutoService);
  // const { contracts: tradingAutoServices,  loading: l14 } = useStreamQueries(TradingAutoService);

  const services : CreateEvent<any>[] = Array.prototype.concat.apply([], [
    backToBackServices,
    custodyServices,
    auctionServices,
    // auctionAutoServices,
    biddingServices,
    // biddingAutoServices,
    subscriptionServices,
    issuanceServices,
    // issuanceAutoServices,
    lifecycleServices,
    listingServices,
    // listingAutoServices,
    tradingServices,
    // tradingAutoServices
  ]);

  const createNode = (p : string, i : number) => ({
      id: p,
      data: { label: getName(p) },
      position: scenario.selected.positions.get(getName(p)) || { x: 0, y: 0 },
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
    if (!l1 && !l2 && !l3 && !l4 && !l5 && !l6 && !l7 && !l8 && !l9) {
      const groupedServices : GroupedServices[] = [];
      services.forEach(c => {
        const elem = groupedServices.find(e => e.provider === c.payload.provider && e.customer === c.payload.customer);
        if (!!elem) elem.services.push(c.templateId.split(":")[1].replace("Daml.Finance.App.", ""));
        else groupedServices.push({ id: c.contractId, provider: c.payload.provider, customer: c.payload.customer, services: [c.templateId.split(":")[1].replace("Daml.Finance.App.", "")]});
      });
      const parties = dedup(groupedServices.flatMap(s => [s.provider, s.customer]));
      setNodes(parties.map(createNode));
      setEdges(groupedServices.map(createEdge));
      setLoading(false);
    };
  }, [scenario, setNodes, setEdges, setLoading, l1, l2, l3, l4, l5, l6, l7, l8, l9]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, loading };
};