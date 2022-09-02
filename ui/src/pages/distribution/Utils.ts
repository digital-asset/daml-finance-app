// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Status as AuctionStatus } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Bid, Status as BidStatus } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model/module";

export const getAuctionStatus = (auctionStatus : AuctionStatus) : string => {
  switch (auctionStatus.tag) {
    case 'PartiallyAllocated' :
      return 'Partially Allocated'
    case 'FullyAllocated' :
      return 'Fully Allocated'
    case 'NoValidBids' :
      return 'No valid Bids'
    default:
      return auctionStatus.tag
  }
}

export const getBidStatus = (bidStatus : BidStatus) : string => {
  switch (bidStatus.tag) {
    case 'PartialAllocation' :
      return 'Partial Allocation'
    case 'FullAllocation' :
      return 'Full Allocation'
    case 'NoAllocation' :
      return 'No Allocation'
    default:
      return bidStatus.tag
  }
}

export const getBidAllocation = (bid : Bid) : string => {
  switch (bid.status.tag) {
    case 'PartialAllocation' :
      return bid.status.value.amount + " " + bid.details.quantity.unit.id.unpack + " @ " + bid.status.value.price + " " + bid.details.price.unit.id.unpack
    case 'FullAllocation' :
      return bid.details.quantity.amount + " " + bid.details.quantity.unit.id.unpack + " @ " + bid.status.value.price + " " + bid.details.price.unit.id.unpack
    default:
      return ""
  }
}
