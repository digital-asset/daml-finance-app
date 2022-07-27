// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { RouteEntry } from "../components/Sidebar/RouteEntry";
import { Auctions as BiddingAuctions } from "../pages/distribution/bidding/Auctions";
import { Auctions } from "../pages/distribution/auction/Auctions";
import { Auction } from "../pages/distribution/auction/Auction";
import { New as NewAuction} from "../pages/distribution/auction/New";
import { New as NewSubscription} from "../pages/distribution/subscription/New";
import { useParty, useStreamQueries } from "@daml/react";
import { Service as AuctionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Service as SubscriptionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Subscription/Service";
import { Requests } from "../pages/distribution/auction/Requests";
import { BiddingAuction } from "../pages/distribution/bidding/Auction";
import { App } from "./App";
import { Spinner } from "../components/Spinner/Spinner";
import { Offerings } from "../pages/distribution/subscription/Offerings";
import { Offering } from "../pages/distribution/subscription/Offering";

export const Distribution : React.FC = () => {
  const party = useParty();

  const { contracts: auctionServices, loading: l1 } = useStreamQueries(AuctionService);
  const { contracts: subscriptionServices, loading: l2 } = useStreamQueries(SubscriptionService);
  if (l1 || l2) return (<Spinner />);

  const providerAuctionService = auctionServices.find(c => c.payload.provider === party);
  const customerAuctionService = auctionServices.find(c => c.payload.customer === party);
  const providerSubscriptionService = subscriptionServices.find(c => c.payload.provider === party);
  const customerSubscriptionService = subscriptionServices.find(c => c.payload.customer === party);
  const isAgent = !!providerAuctionService || !!providerSubscriptionService;
  const isIssuer = !!customerAuctionService || !!customerSubscriptionService;

  const entries : RouteEntry[] = [];
  if (isIssuer) {
    entries.push({ label: "Auctions", path: "auctions", element: <Auctions />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "Requests", path: "requests", element: <Requests />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "New", path: "new", element: <></>, icon: <PlayArrow/>, children: [
      { label: "Auction", path: "new/auction", element: <NewAuction />, icon: <></>, children: [] },
      { label: "Offering", path: "new/offering", element: <NewSubscription />, icon: <></>, children: [] }
    ] });
  } else if (isAgent) {
    entries.push({ label: "Auctions", path: "auctions", element: <Auctions />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "Requests", path: "requests", element: <Requests />, icon: <PlayArrow/>, children: [] });
  } else {
    entries.push({ label: "Auctions", path: "auctions", element: <BiddingAuctions />, icon: <PlayArrow/>, children: [] });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings />, icon: <PlayArrow/>, children: [] });
  }
  entries.push({ path: "auctions/:contractId", element: <Auction /> });
  entries.push({ path: "auction/:contractId", element: <BiddingAuction /> });
  entries.push({ path: "subscriptions/:contractId", element: <Offering /> });
  entries.push({ path: "new/auction", element: <NewAuction /> });
  entries.push({ path: "new/offering", element: <NewSubscription /> });

  return <App title="Distribution Portal" entries={entries} />;
}
