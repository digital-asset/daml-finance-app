// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useStreamQueries } from "@daml/react";
import { keyEquals } from "../util";
import { Holding } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Holding";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { Fungible } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Fungible";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";
import { ContractId } from "@daml/types";
import { Lockable } from "@daml.js/daml-finance-interface-util/lib/Daml/Finance/Interface/Util/Lockable";

type HoldingState = {
  loading : boolean
  holdings : HoldingAggregate[]
  getFungible : (owner : string, amount : number | string, instrument: InstrumentKey, custodian?: string ) => Promise<ContractId<Fungible>>
};

export type HoldingAggregate = CreateEvent<Holding> & {
  transferable : CreateEvent<Transferable> | undefined
  fungible : CreateEvent<Fungible> | undefined
  lockable : CreateEvent<Lockable> | undefined
}

const empty = {
  loading: true,
  holdings: [],
  getFungible: (owner : string, amount : number | string, instrument: InstrumentKey, custodian?: string) => { throw new Error("Not implemented"); }
};

const HoldingContext = React.createContext<HoldingState>(empty);

export const HoldingProvider : React.FC = ({ children }) => {

  const ledger = useLedger();
  const { contracts: holdings, loading: l1 } = useStreamQueries(Holding);
  const { contracts: transferables, loading: l2 } = useStreamQueries(Transferable);
  const { contracts: fungibles, loading: l3 } = useStreamQueries(Fungible);
  const { contracts: lockables, loading: l4 } = useStreamQueries(Lockable);

  const loading = l1 || l2 || l3 || l4;

  if (loading) {
    return (
      <HoldingContext.Provider value={empty}>
          {children}
      </HoldingContext.Provider>
    );
  } else {
    const transferablesByCid : Map<string, CreateEvent<Transferable>> = new Map(transferables.map(c => [c.contractId, c]));
    const fungiblesByCid : Map<string, CreateEvent<Fungible>> = new Map(fungibles.map(c => [c.contractId, c]));
    const lockablesByCid : Map<string, CreateEvent<Lockable>> = new Map(lockables.map(c => [c.contractId, c]));
    const aggregates : HoldingAggregate[] = holdings.map(c => ({
      ...c,
      transferable: transferablesByCid.get(c.contractId),
      fungible: fungiblesByCid.get(c.contractId),
      lockable: lockablesByCid.get(c.contractId)
    }));

    const getFungible = async (owner : string, amount : number | string, instrument: InstrumentKey, custodian?: string) : Promise<ContractId<Fungible>> => {
      const qty = typeof amount === "string" ? parseFloat(amount) : amount;
      const filtered = aggregates
        .filter(c => c.payload.account.owner === owner && keyEquals(c.payload.instrument, instrument) && (!c.lockable || !c.lockable.payload.lock))
        .filter(c => custodian === undefined || c.payload.account.custodian === custodian);
      if (filtered.length === 0) throw new Error("Could not find unencumbered holding on instrument [" + instrument.id.unpack + "]");
      if (!filtered[0].fungible) throw new Error("Holdings are not fungible, cannot right-size to correct amount.");
      const sum = filtered.reduce((a, b) => a + parseFloat(b.payload.amount), 0);
      if (filtered.length === 0 || sum < qty) throw new Error("Insufficient holdings (" + sum.toFixed(4) + ") for " + qty.toFixed(4) + " " + instrument.id.unpack);
      if (filtered.length === 1 && sum === qty) return filtered[0].fungible.contractId;
      if (filtered.length === 1 && sum > qty) {
        const [ { splitCids, }, ] = await ledger.exercise(Fungible.Split, filtered[0].fungible.contractId, { amounts: [ qty.toString() ] });
        return splitCids[0];
      }
      const [h, ...t] = filtered;
      const [fungibleCid, ] = await ledger.exercise(Fungible.Merge, h.fungible!.contractId, { fungibleCids: t.map(c => c.fungible!.contractId) });
      if (sum === qty) return fungibleCid;

      const [ { splitCids, }, ] = await ledger.exercise(Fungible.Split, fungibleCid, { amounts: [ qty.toString() ] });
      return splitCids[0];
    }

    const value = {
      loading,
      holdings: aggregates,
      getFungible
    };

    return (
      <HoldingContext.Provider value={value}>
          {children}
      </HoldingContext.Provider>
    );
  }
};

export const useHoldings = () => {
  return React.useContext(HoldingContext);
}
