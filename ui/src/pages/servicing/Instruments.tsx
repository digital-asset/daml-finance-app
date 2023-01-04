// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Service } from "@daml.js/daml-finance-app-interface-lifecycle/lib/Daml/Finance/App/Interface/Lifecycle/Service";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { InstrumentAggregate, useInstruments } from "../../context/InstrumentContext";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { useNavigate } from "react-router-dom";

export const Instruments : React.FC = () => {
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, lifecycle } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, contracts: numericObservables } = useStreamQueries(NumericObservable);
  const { loading: l4, contracts: events } = useStreamQueries(Event);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const myInstruments = latests.filter(a => a.payload.issuer === party && (!!a.claim || !!a.equity));

  const lifecycleAll = async (cs : any[]) => {
    // TODO: Assumes single service
    const svc = lifecycle.services[0]?.service;
    if (!svc) throw new Error("No lifecycle service found for customer [" + party + "]");
    const lifecycleOne = async (c : InstrumentAggregate) => {
      if (!c.claim) return;
      const ruleCid = !!c.generic ? svc.payload.genericRuleCid : svc.payload.dynamicRuleCid;
      const arg = {
        ruleCid,
        // TODO: Assumes the only event we have is a DateClockUpdatedEvent
        instrument : c.key,
        eventCid: events[0].contractId,
        observableCids: numericObservables.map(o => o.contractId),
      }
      await ledger.exercise(Service.Lifecycle, svc.contractId, arg);
    };
    await Promise.all(cs.map(c => lifecycleOne(c as InstrumentAggregate)));
    navigate("/app/servicing/effects");
  };

  const createRow = (c : InstrumentAggregate) : any[] => {
    return [
      getName(c.payload.depository),
      getName(c.payload.issuer),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.version,
      c.payload.validAsOf,
      <DetailButton path={c.contractId} />
    ];
  }
  const headers = ["Depository", "Issuer", "Id", "Description", "Version", "ValidAsOf", "Details"];
  const values : any[] = myInstruments.map(createRow);
  return (
    <SelectionTable title="Instruments" variant={"h3"} headers={headers} values={values} action="Lifecycle" onExecute={lifecycleAll} callbackValues={myInstruments} />
  );
};
