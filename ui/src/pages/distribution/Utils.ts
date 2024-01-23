// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Bid } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Bidding/Model/module";

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
