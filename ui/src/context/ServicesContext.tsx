// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
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
import { Service as StructuringService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service"
import { Service as StructuringAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service"
import { Service as ListingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service"
import { Service as ListingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service"
import { Service as TradingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Service"
import { Service as TradingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Auto/Service"

export type ServicesState = {
  loading : boolean
  backToBack : readonly CreateEvent<BackToBackService, BackToBackService.Key>[]
  custody : readonly CreateEvent<CustodyService, CustodyService.Key>[]
  auctionAuto : readonly CreateEvent<AuctionAutoService, AuctionAutoService.Key>[]
  auction : readonly CreateEvent<AuctionService, AuctionService.Key>[]
  biddingAuto : readonly CreateEvent<BiddingAutoService, BiddingAutoService.Key>[]
  bidding : readonly CreateEvent<BiddingService, BiddingService.Key>[]
  issuanceAuto  :readonly  CreateEvent<IssuanceAutoService, IssuanceAutoService.Key>[]
  issuance  :readonly  CreateEvent<IssuanceService, IssuanceService.Key>[]
  lifecycle : readonly CreateEvent<LifecycleService, LifecycleService.Key>[]
  listingAuto : readonly CreateEvent<ListingAutoService, ListingAutoService.Key>[]
  listing : readonly CreateEvent<ListingService, ListingService.Key>[]
  structuringAuto : readonly CreateEvent<StructuringAutoService, StructuringAutoService.Key>[]
  structuring : readonly CreateEvent<StructuringService, StructuringService.Key>[]
  subscription  :readonly  CreateEvent<SubscriptionService, SubscriptionService.Key>[]
  tradingAuto : readonly CreateEvent<TradingAutoService, TradingAutoService.Key>[]
  trading : readonly CreateEvent<TradingService, TradingService.Key>[]
};

const empty = {
  loading: true,
  backToBack: [],
  custody: [],
  auctionAuto: [],
  auction: [],
  biddingAuto: [],
  bidding: [],
  issuanceAuto: [],
  issuance: [],
  lifecycle: [],
  listingAuto: [],
  listing: [],
  structuringAuto: [],
  structuring: [],
  subscription: [],
  tradingAuto: [],
  trading: []
};

const ServicesContext = React.createContext<ServicesState>(empty);

export const ServicesProvider : React.FC = ({ children }) => {

  const { contracts: backToBack,      loading: l1 } =  useStreamQueries(BackToBackService);
  const { contracts: custody,         loading: l2 } =  useStreamQueries(CustodyService);
  const { contracts: auctionAuto,     loading: l3 } =  useStreamQueries(AuctionAutoService);
  const { contracts: auction,         loading: l4 } =  useStreamQueries(AuctionService);
  const { contracts: biddingAuto,     loading: l5 } =  useStreamQueries(BiddingAutoService);
  const { contracts: bidding,         loading: l6 } =  useStreamQueries(BiddingService);
  const { contracts: issuanceAuto,    loading: l7 } =  useStreamQueries(IssuanceAutoService);
  const { contracts: issuance,        loading: l8 } =  useStreamQueries(IssuanceService);
  const { contracts: lifecycle,       loading: l9 } =  useStreamQueries(LifecycleService);
  const { contracts: listingAuto,     loading: l10 } = useStreamQueries(ListingAutoService);
  const { contracts: listing,         loading: l11 } = useStreamQueries(ListingService);
  const { contracts: structuringAuto, loading: l12 } = useStreamQueries(StructuringAutoService);
  const { contracts: structuring,     loading: l13 } = useStreamQueries(StructuringService);
  const { contracts: subscription,    loading: l14 } = useStreamQueries(SubscriptionService);
  const { contracts: tradingAuto,     loading: l15 } = useStreamQueries(TradingAutoService);
  const { contracts: trading,         loading: l16 } = useStreamQueries(TradingService);
  const loading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11 || l12 || l13 || l14 || l15 || l16;

  const value = {
    loading,
    backToBack,
    custody,
    auctionAuto,
    auction,
    biddingAuto,
    bidding,
    issuanceAuto,
    issuance,
    lifecycle,
    listingAuto,
    listing,
    structuringAuto,
    structuring,
    subscription,
    tradingAuto,
    trading,
  };

  return (
    <ServicesContext.Provider value={value}>
        {children}
    </ServicesContext.Provider>
  );
}

export const useServices = () => {
  return React.useContext(ServicesContext);
}
