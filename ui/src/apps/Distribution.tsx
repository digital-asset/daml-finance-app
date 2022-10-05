// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { PlayArrow } from "@mui/icons-material";
import { Entry } from "../components/Sidebar/Route";
import { Auctions as BiddingAuctions } from "../pages/distribution/bidding/Auctions";
import { Auctions } from "../pages/distribution/auction/Auctions";
import { Auction } from "../pages/distribution/auction/Auction";
import { New as NewAuction} from "../pages/distribution/auction/New";
import { New as NewSubscription} from "../pages/distribution/subscription/New";
import { useParty, useStreamQueries } from "@daml/react";
import { Requests } from "../pages/distribution/auction/Requests";
import { Bidding } from "../pages/distribution/auction/Bidding";
import { App } from "./App";
import { Spinner } from "../components/Spinner/Spinner";
import { Offerings } from "../pages/distribution/subscription/Offerings";
import { Offering } from "../pages/distribution/subscription/Offering";
import { useServices } from "../context/ServiceContext";

export const Distribution : React.FC = () => {
  const party = useParty();
  const { loading: l1, auction, subscription } = useServices();
  if (l1) return <Spinner />;

  const providerAuctionService = auction.find(c => c.payload.provider === party);
  const customerAuctionService = auction.find(c => c.payload.customer === party);
  const providerSubscriptionService = subscription.find(c => c.payload.provider === party);
  const customerSubscriptionService = subscription.find(c => c.payload.customer === party);
  const isAgent = !!providerAuctionService || !!providerSubscriptionService;
  const isIssuer = !!customerAuctionService || !!customerSubscriptionService;

  const entries : Entry[] = [];
  if (isIssuer) {
    entries.push({ label: "Auctions", path: "auctions", element: <Auctions /> });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings /> });
    entries.push({ label: "Requests", path: "requests", element: <Requests /> });
    entries.push({ label: "New Auction", path: "new/auction", element: <NewAuction />, action: true });
    entries.push({ label: "New Offering", path: "new/offering", element: <NewSubscription />, action: true });
  } else if (isAgent) {
    entries.push({ label: "Auctions", path: "auctions", element: <Auctions /> });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings /> });
    entries.push({ label: "Requests", path: "requests", element: <Requests /> });
  } else {
    entries.push({ label: "Auctions", path: "auctions", element: <BiddingAuctions /> });
    entries.push({ label: "Offerings", path: "offerings", element: <Offerings /> });
  }
  const paths = [
    { path: "auctions/:contractId", element: <Auction /> },
    { path: "auction/:contractId", element: <Bidding /> },
    { path: "subscriptions/:contractId", element: <Offering /> },
    { path: "new/auction", element: <NewAuction /> },
    { path: "new/offering", element: <NewSubscription /> },
  ];

  return <App app="Distribution" entries={entries} paths={paths}/>;
}
