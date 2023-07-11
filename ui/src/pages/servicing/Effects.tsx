// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { dedup, fmt, keyEquals } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { CreateEvent } from "@daml/ledger";
import { useParties } from "../../context/PartiesContext";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { useNavigate } from "react-router-dom";
import { Claim } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Rule";
import { useServices } from "../../context/ServiceContext";

export const Effects : React.FC = () => {
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getNames, getParty } = useParties();
  const { loading: l1, custody } = useServices();
  const { loading: l2, contracts: effects } = useStreamQueries(Effect);
  const { loading: l3, contracts: holdings } = useStreamQueries(Base);

  const cs = custody.find(c => c.payload.customer === party) || custody[0];
  if (l1 || l2 || l3 || !cs) return <Spinner />;
  const isOp = getParty("Operator") === party;

  const claimEffects = async (effects : any[]) => {
    const holdingCids = effects.map(effect => holdings.find(c => keyEquals(c.payload.instrument, effect.payload.targetInstrument))!.contractId);
    const arg = {
      claimer: party,
      holdingCids,
      effectCids: effects.map(c => c.contractId),
      batchId: { unpack: "SETTLE-"  + effects[0]?.payload.id.unpack}
    };
    await ledger.exercise(Claim.ClaimEffects, cs.payload.claimRuleCid, arg);
    navigate("/app/orchestration/settlement")
  };

  const createRow = (c : CreateEvent<Effect>) : any[] => {
    const filtered = holdings.filter(h => keyEquals(h.payload.instrument, c.payload.targetInstrument));
    const isCustodian = isOp ? false : filtered[0].payload.account.custodian === party;
    const produced = c.payload.otherProduced[0];
    const consumed = c.payload.otherConsumed[0];
    return [
      getNames(c.payload.providers),
      c.payload.id.unpack,
      c.payload.targetInstrument.id.unpack,
      isCustodian ? (!!produced ? fmt(produced.amount) + " " + produced.unit.id.unpack : "") : (!!consumed ? fmt(consumed.amount) + " " + consumed.unit.id.unpack : ""),
      isCustodian ? (!!consumed ? fmt(consumed.amount) + " " + consumed.unit.id.unpack : "") : (!!produced ? fmt(produced.amount) + " " + produced.unit.id.unpack : ""),
      <DetailButton path={c.contractId} />
    ];
  }

  const currencies = dedup(effects.flatMap(c => c.payload.otherProduced.map(x => x.unit.id.unpack).concat(c.payload.otherConsumed.map(x => x.unit.id.unpack))));

  const createRow2 = (ccy : string) : any[] => {
    var pay = 0;
    var rec = 0;
    for (var i = 0; i < effects.length; i++) {
      const c = effects[i];
      const filtered = holdings.filter(h => keyEquals(h.payload.instrument, c.payload.targetInstrument));
      const isCustodian = isOp ? false : filtered[0].payload.account.custodian === party;
      const produced = (c.payload.otherProduced[0]?.unit.id.unpack === ccy && c.payload.otherProduced[0]?.amount) || "0";
      const consumed = (c.payload.otherConsumed[0]?.unit.id.unpack === ccy && c.payload.otherConsumed[0]?.amount) || "0";
      pay += isCustodian ? parseFloat(produced) : parseFloat(consumed);
      rec += isCustodian ? parseFloat(consumed) : parseFloat(produced);
    }
    return [
      ccy,
      fmt(pay),
      fmt(rec),
    ];
  }

  const headers = ["Counterparties", "Date", "Source", isOp ? "Bank A pays" : "Pay", isOp ? "Bank B pays" : "Receive", "Details"];
  const values : any[] = effects.map(createRow);
  const headers2 = ["Currency", isOp ? "Bank A pays" : "Pay", isOp ? "Bank B pays" : "Receive"];
  const values2 : any[] = currencies.map(createRow2);
  const callbackValues = effects.map(c => c as any);
  return (
    <>
      <SelectionTable title="Obligations" variant={"h3"} headers={headers} values={values} action="Net & Instruct" onExecute={claimEffects} callbackValues={callbackValues} />
      <HorizontalTable title="Summary" variant={"h3"} headers={headers2} values={values2} />
    </>
  );
};
