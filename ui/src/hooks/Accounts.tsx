// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStreamQueries } from "@daml/react";
import { Account } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Account";

export const useAccounts = () : Map<string, string> => {
  const { contracts: accounts } = useStreamQueries(Account);
  const result = new Map<string, string>();
  accounts.forEach(a => result.set(a.contractId, a.payload.id));
  return result;
};
