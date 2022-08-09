import React, { useEffect } from "react";
import { useStreamQueries } from "@daml/react";
import { Service as BackToBackService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service"
import { Service as CustodyService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Custody/Service"
import { Service as AuctionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service"
import { Service as AuctionAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Auto/Service"
import { Service as BiddingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Service"
import { Service as BiddingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Auto/Service"
import { Service as SubscriptionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Service"
import { Service as IssuanceService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service"
import { Service as IssuanceAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service"
import { Service as LifecycleService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service"
import { Service as ListingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service"
import { Service as ListingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service"
import { Service as TradingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Service"
import { Service as TradingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Auto/Service"
import { getParty } from "../../util";
import ReactFlow, { Background, Controls, Edge, MarkerType, MiniMap, Node, useEdgesState, useNodesState } from "react-flow-renderer";
import { partyIds } from "../../config";
import { Spinner } from "../../components/Spinner/Spinner";
import { CreateEvent } from "@daml/ledger";

type GroupedServices = {
  id : string
  provider : string
  customer : string
  services : string[]
};

export const Overview : React.FC = () => {

  const { contracts: backToBackServices,   loading: l1 } =  useStreamQueries(BackToBackService);
  const { contracts: custodyServices,      loading: l2 } =  useStreamQueries(CustodyService);
  const { contracts: auctionServices,      loading: l3 } =  useStreamQueries(AuctionService);
  const { contracts: auctionAutoServices,  loading: l4 } =  useStreamQueries(AuctionAutoService);
  const { contracts: biddingServices,      loading: l5 } =  useStreamQueries(BiddingService);
  const { contracts: biddingAutoServices,  loading: l6 } =  useStreamQueries(BiddingAutoService);
  const { contracts: subscriptionServices, loading: l7 } =  useStreamQueries(SubscriptionService);
  const { contracts: issuanceServices,     loading: l8 } =  useStreamQueries(IssuanceService);
  const { contracts: issuanceAutoServices, loading: l9 } =  useStreamQueries(IssuanceAutoService);
  const { contracts: lifecycleServices,    loading: l10 } = useStreamQueries(LifecycleService);
  const { contracts: listingServices,      loading: l11 } = useStreamQueries(ListingService);
  const { contracts: listingAutoServices,  loading: l12 } = useStreamQueries(ListingAutoService);
  const { contracts: tradingServices,      loading: l13 } = useStreamQueries(TradingService);
  const { contracts: tradingAutoServices,  loading: l14 } = useStreamQueries(TradingAutoService);

  const services : CreateEvent<any>[] = Array.prototype.concat.apply([], [
    backToBackServices,
    custodyServices,
    auctionServices,
    auctionAutoServices,
    biddingServices,
    biddingAutoServices,
    subscriptionServices,
    issuanceServices,
    issuanceAutoServices,
    lifecycleServices,
    listingServices,
    listingAutoServices,
    tradingServices,
    tradingAutoServices
  ]);

  const groupedServices : GroupedServices[] = [];
  services.forEach(c => {
    const elem = groupedServices.find(e => e.provider === c.payload.provider && e.customer === c.payload.customer);
    if (!!elem) elem.services.push(c.templateId.split(":")[1].replace("Daml.Finance.App.", ""));
    else groupedServices.push({ id: c.contractId, provider: c.payload.provider, customer: c.payload.customer, services: [c.templateId.split(":")[1].replace("Daml.Finance.App.", "")]});
  });

  const parties = Object.keys(partyIds);
  const initialNodes : Node[] = parties.map((p, i) => (
    {
      id: getParty(p),
      type: "default",
      data: { label: p },
      position: { x: i * 200, y: 0 },
      style: { width: 160 }
    }
  ));

  const createEdge = (c : GroupedServices) : Edge => ({
    id: c.id,
    source: c.provider,
    target: c.customer,
    label: (<>{c.services.map((s, i) => (<tspan x={0} y={6 + i * 15}>{s}</tspan>))}</>),
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: c.provider === c.customer ? { fill: "#FFCC00", color: "#fff", fillOpacity: 0.7, transform: "translate(150px)" } : { fill: "#FFCC00", color: "#fff", fillOpacity: 0.7 },
    labelStyle: c.provider === c.customer ? { transform: "translate(150px)" } : {},
    type: "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    // animated: true
  });

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!l1 && !l2 && !l3 && !l4 && !l5 && !l6 && !l7 && !l8 && !l9 && !l10 && !l11 && !l12 && !l13 && !l14) {
      console.log(groupedServices);
      setEdges(groupedServices.map(createEdge));
    };
  }, [setEdges, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14]);

  if (l1) return (<Spinner />);

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView snapToGrid snapGrid={[20, 20]} style={{ height: "90%" }} nodesConnectable={false} >
      <MiniMap style={{ backgroundColor: "#ccc" }} />
      <Controls showZoom={false} showInteractive={false} />
      <Background gap={20}/>
    </ReactFlow>
  );
};
