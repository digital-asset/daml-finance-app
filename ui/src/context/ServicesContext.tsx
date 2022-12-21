// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useStreamQueries } from "@daml/react";
import { Service as BaseService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Base/Service"
import { Service as BackToBackService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/BackToBack"
import { Service as CustodyService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Custody/Service"
import { Service as CustodyAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Custody/Auto"
import { Service as DecentralizedExchangeService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Decentralized/Exchange/Service"
import { Service as AuctionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/Service"
import { Service as AuctionAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/Auto"
import { Service as BiddingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Bidding/Service"
import { Service as BiddingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Bidding/Auto"
import { Service as SubscriptionService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Subscription/Service"
import { Service as FundService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Fund/Service"
import { Service as InvestmentService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Investment/Service"
import { Service as IssuanceService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/Service"
import { Service as IssuanceAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Issuance/Auto"
import { Service as LendingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Lending/Service"
import { Service as LifecycleService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Lifecycle/Service"
import { Service as StructuringService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Structuring/Service"
import { Service as StructuringAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Structuring/Auto"
import { Service as ListingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Service"
import { Service as ListingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Auto"
import { Service as SettlementService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Settlement/Service"
import { Service as TradingService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Trading/Service"
import { Service as TradingAutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Trading/Auto"

type ServicesAggregate<S extends object> = {
  services : ServiceAggregate<S>[]
  getService : (provider : string, customer : string) => ServiceAggregate<S> | undefined
};

type ServiceAggregate<S extends object> = CreateEvent<BaseService> & {
  service : CreateEvent<S>
};

export type ServicesState = {
  loading               : boolean
  auction               : ServicesAggregate<AuctionService>
  auctionAuto           : ServicesAggregate<AuctionAutoService>
  backToBack            : ServicesAggregate<BackToBackService>
  bidding               : ServicesAggregate<BiddingService>
  biddingAuto           : ServicesAggregate<BiddingAutoService>
  custody               : ServicesAggregate<CustodyService>
  custodyAuto           : ServicesAggregate<CustodyAutoService>
  decentralizedExchange : ServicesAggregate<DecentralizedExchangeService>
  fund                  : ServicesAggregate<FundService>
  investment            : ServicesAggregate<InvestmentService>
  issuance              : ServicesAggregate<IssuanceService>
  issuanceAuto          : ServicesAggregate<IssuanceAutoService>
  lending               : ServicesAggregate<LendingService>
  lifecycle             : ServicesAggregate<LifecycleService>
  listing               : ServicesAggregate<ListingService>
  listingAuto           : ServicesAggregate<ListingAutoService>
  settlement            : ServicesAggregate<SettlementService>
  structuring           : ServicesAggregate<StructuringService>
  structuringAuto       : ServicesAggregate<StructuringAutoService>
  subscription          : ServicesAggregate<SubscriptionService>
  trading               : ServicesAggregate<TradingService>
  tradingAuto           : ServicesAggregate<TradingAutoService>
};

const emptyAggregate = {
  services: [],
  getService: (provider : string, customer : string) => { throw new Error("Not implemented"); }
};

const empty = {
  loading: true,
  auction               : emptyAggregate,
  auctionAuto           : emptyAggregate,
  backToBack            : emptyAggregate,
  bidding               : emptyAggregate,
  biddingAuto           : emptyAggregate,
  custody               : emptyAggregate,
  custodyAuto           : emptyAggregate,
  decentralizedExchange : emptyAggregate,
  fund                  : emptyAggregate,
  investment            : emptyAggregate,
  issuance              : emptyAggregate,
  issuanceAuto          : emptyAggregate,
  lending               : emptyAggregate,
  lifecycle             : emptyAggregate,
  listing               : emptyAggregate,
  listingAuto           : emptyAggregate,
  settlement            : emptyAggregate,
  structuring           : emptyAggregate,
  structuringAuto       : emptyAggregate,
  subscription          : emptyAggregate,
  trading               : emptyAggregate,
  tradingAuto           : emptyAggregate,
};

const ServicesContext = React.createContext<ServicesState>(empty);

export const ServicesProvider : React.FC = ({ children }) => {

  const { loading: l1,  contracts: base }                   = useStreamQueries(BaseService);
  const { loading: l2,  contracts: auctionAuto }            = useStreamQueries(AuctionAutoService);
  const { loading: l3,  contracts: auction }                = useStreamQueries(AuctionService);
  const { loading: l4,  contracts: backToBack }             = useStreamQueries(BackToBackService);
  const { loading: l5,  contracts: biddingAuto }            = useStreamQueries(BiddingAutoService);
  const { loading: l6,  contracts: bidding }                = useStreamQueries(BiddingService);
  const { loading: l7,  contracts: custody }                = useStreamQueries(CustodyService);
  const { loading: l8,  contracts: custodyAuto }            = useStreamQueries(CustodyAutoService);
  const { loading: l9,  contracts: decentralizedExchange }  = useStreamQueries(DecentralizedExchangeService);
  const { loading: l10, contracts: fund }                   = useStreamQueries(FundService);
  const { loading: l11, contracts: investment }             = useStreamQueries(InvestmentService);
  const { loading: l12, contracts: issuance }               = useStreamQueries(IssuanceService);
  const { loading: l13, contracts: issuanceAuto }           = useStreamQueries(IssuanceAutoService);
  const { loading: l14, contracts: lending }                = useStreamQueries(LendingService);
  const { loading: l15, contracts: lifecycle }              = useStreamQueries(LifecycleService);
  const { loading: l16, contracts: listingAuto }            = useStreamQueries(ListingAutoService);
  const { loading: l17, contracts: listing }                = useStreamQueries(ListingService);
  const { loading: l18, contracts: settlement }             = useStreamQueries(SettlementService);
  const { loading: l19, contracts: structuringAuto }        = useStreamQueries(StructuringAutoService);
  const { loading: l20, contracts: structuring }            = useStreamQueries(StructuringService);
  const { loading: l21, contracts: subscription }           = useStreamQueries(SubscriptionService);
  const { loading: l22, contracts: tradingAuto }            = useStreamQueries(TradingAutoService);
  const { loading: l23, contracts: trading }                = useStreamQueries(TradingService);
  const loading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11 || l12 || l13 || l14 || l15 || l16 || l17 || l18 || l19 || l20 || l21 || l22 || l23;

  const createServicesAggregate = <S extends object>(services : readonly CreateEvent<S>[]) : ServicesAggregate<S> => {
    const serviceByCid : Map<string, CreateEvent<S>> = new Map(services.map(c => [c.contractId, c]));
    const filteredBase = base.filter(c => serviceByCid.has(c.contractId as string));
    const aggregates : ServiceAggregate<S>[] = filteredBase.map(c => ({ ...c, service: serviceByCid.get(c.contractId)! }));
    const getService = (provider : string, customer : string) => { return aggregates.find(c => c.payload.provider === provider && c.payload.customer === customer) };
    return { services: aggregates, getService };
  };

  if (loading) {
    return (
      <ServicesContext.Provider value={empty}>
          {children}
      </ServicesContext.Provider>
    );
  } else {

    const value = {
      loading,
      auction               : createServicesAggregate(auction),
      auctionAuto           : createServicesAggregate(auctionAuto),
      backToBack            : createServicesAggregate(backToBack),
      bidding               : createServicesAggregate(bidding),
      biddingAuto           : createServicesAggregate(biddingAuto),
      custody               : createServicesAggregate(custody),
      custodyAuto           : createServicesAggregate(custodyAuto),
      decentralizedExchange : createServicesAggregate(decentralizedExchange),
      fund                  : createServicesAggregate(fund),
      investment            : createServicesAggregate(investment),
      issuance              : createServicesAggregate(issuance),
      issuanceAuto          : createServicesAggregate(issuanceAuto),
      lending               : createServicesAggregate(lending),
      lifecycle             : createServicesAggregate(lifecycle),
      listing               : createServicesAggregate(listing),
      listingAuto           : createServicesAggregate(listingAuto),
      settlement            : createServicesAggregate(settlement),
      structuring           : createServicesAggregate(structuring),
      structuringAuto       : createServicesAggregate(structuringAuto),
      subscription          : createServicesAggregate(subscription),
      trading               : createServicesAggregate(trading),
      tradingAuto           : createServicesAggregate(tradingAuto),
    };

    return (
      <ServicesContext.Provider value={value}>
          {children}
      </ServicesContext.Provider>
    );
  }
}

export const useServices = () => {
  return React.useContext(ServicesContext);
}
