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
import { Service as LendingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Service"
import { Service as LifecycleService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service"
import { Service as StructuringService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service"
import { Service as StructuringAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service"
import { Service as ListingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service"
import { Service as ListingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service"
import { Service as SettlementService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Settlement/Service"
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
  lending : readonly CreateEvent<LendingService, LendingService.Key>[]
  lifecycle : readonly CreateEvent<LifecycleService, LifecycleService.Key>[]
  listingAuto : readonly CreateEvent<ListingAutoService, ListingAutoService.Key>[]
  listing : readonly CreateEvent<ListingService, ListingService.Key>[]
  settlement : readonly CreateEvent<SettlementService, SettlementService.Key>[]
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
  lending: [],
  lifecycle: [],
  listingAuto: [],
  listing: [],
  settlement: [],
  structuringAuto: [],
  structuring: [],
  subscription: [],
  tradingAuto: [],
  trading: []
};

const ServicesContext = React.createContext<ServicesState>(empty);

export const ServicesProvider : React.FC = ({ children }) => {

  const { loading: l1,  contracts: backToBack }       = useStreamQueries(BackToBackService);
  const { loading: l2,  contracts: custody }          = useStreamQueries(CustodyService);
  const { loading: l3,  contracts: auctionAuto }      = useStreamQueries(AuctionAutoService);
  const { loading: l4,  contracts: auction }          = useStreamQueries(AuctionService);
  const { loading: l5,  contracts: biddingAuto }      = useStreamQueries(BiddingAutoService);
  const { loading: l6,  contracts: bidding }          = useStreamQueries(BiddingService);
  const { loading: l7,  contracts: issuanceAuto }     = useStreamQueries(IssuanceAutoService);
  const { loading: l8,  contracts: issuance }         = useStreamQueries(IssuanceService);
  const { loading: l9,  contracts: lending }          = useStreamQueries(LendingService);
  const { loading: l10, contracts: lifecycle }        = useStreamQueries(LifecycleService);
  const { loading: l11, contracts: listingAuto }      = useStreamQueries(ListingAutoService);
  const { loading: l12, contracts: listing }          = useStreamQueries(ListingService);
  const { loading: l13, contracts: settlement }       = useStreamQueries(SettlementService);
  const { loading: l14, contracts: structuringAuto }  = useStreamQueries(StructuringAutoService);
  const { loading: l15, contracts: structuring }      = useStreamQueries(StructuringService);
  const { loading: l16, contracts: subscription }     = useStreamQueries(SubscriptionService);
  const { loading: l17, contracts: tradingAuto }      = useStreamQueries(TradingAutoService);
  const { loading: l18, contracts: trading }          = useStreamQueries(TradingService);
  const loading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11 || l12 || l13 || l14 || l15 || l16 || l17 || l18;

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
    lending,
    lifecycle,
    listingAuto,
    listing,
    settlement,
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
