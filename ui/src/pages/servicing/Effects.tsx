// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { dedup, keyEquals, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { CreateEvent } from "@daml/ledger";
import { useParties } from "../../context/PartiesContext";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { Claim } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Claim";
import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const Effects : React.FC = () => {
  const party = useParty();
  const ledger = useLedger();
  const { getNames } = useParties();
  const { loading: l1, contracts: effects } = useStreamQueries(Effect);
  const { loading: l2, contracts: holdings } = useStreamQueries(Base);
  const { loading: l3, contracts: claimRules } = useStreamQueries(Claim);

  if (l1 || l2 || l3) return <Spinner />;

  const claimEffects = async (effects : any[]) => {
    const claimEffect = async (effect : CreateEvent<Effect>) => {
      const filtered = holdings.filter(c => keyEquals(c.payload.instrument, effect.payload.targetInstrument));
      const holdingCids = filtered.map(c => c.contractId);
      const custodians = dedup(filtered.map(c => c.payload.account.custodian));
      const owners = dedup(filtered.map(c => c.payload.account.owner));
      if (custodians.length > 1 || owners.length > 1) throw new Error("Cannot claim holdings on multiple custodians or owners.");
      const claimRule = claimRules.find(c => c.payload.providers.map.has(custodians[0]) && c.payload.providers.map.has(owners[0]));
      if (!claimRule) throw new Error("Couldn't find claim rule for custodian [" + custodians[0] + "] and owner [" + owners[0] + "].");
      const arg = {
        claimer: party,
        holdingCids,
        effectCid: effect.contractId,
        batchId: { unpack: "SETTLE-"  + effect.payload.targetInstrument.id.unpack + "-" + effect.payload.id.unpack }
      };
      await ledger.exercise(Claim.ClaimEffect, claimRule.contractId, arg);
    };
    await Promise.all(effects.map(e => claimEffect(e as CreateEvent<Effect>)));
  };
  const createRow = (c : CreateEvent<Effect>) : any[] => {
    return [
      getNames(c.payload.providers),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.targetInstrument.id.unpack + " (v" + shorten(c.payload.targetInstrument.version) + ")",
      !!c.payload.producedInstrument ? c.payload.targetInstrument.id.unpack + " (v" + shorten(c.payload.producedInstrument.version) + ")" : "",
      holdings.filter(h => keyEquals(c.payload.targetInstrument, h.payload.instrument)).length,
      <DetailButton path={c.contractId} />
    ];
  }
  const headers = ["Providers", "Id", "Description", "Target", "Produced", "Positions", "Details"];
  const values : any[] = effects.map(createRow);
  const callbackValues = effects.map(c => c as any);
  return (
    <SelectionTable title="Effects" variant={"h3"} headers={headers} values={values} action="Claim" onExecute={claimEffects} callbackValues={callbackValues} />
  );
};
