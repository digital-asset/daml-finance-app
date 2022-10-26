// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { InstrumentAggregate, useInstruments } from "../../context/InstrumentContext";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { Observable } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/Observable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { SelectionTable } from "../../components/Table/SelectionTable";

export const Instruments : React.FC = () => {
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const svc = useServices();
  const inst = useInstruments();

  const { loading: l1, contracts: observables } = useStreamQueries(Observable);
  const { loading: l2, contracts: events } = useStreamQueries(Event);
  const { loading: l3, contracts: clocks } = useStreamQueries(Clock);

  if (l1 || l2 || l3 || svc.loading || inst.loading) return <Spinner />;

  const myInstruments = inst.latests.filter(a => (!!a.lifecycle && a.lifecycle.payload.lifecycler === party) || (!!a.equity && a.payload.issuer === party));

  const lifecycle = async (c : any) => {
    const arg = {
      ruleName: "Time",
      // TODO: Assumes the only event we have is a DateClockUpdatedEvent
      eventCid: events[0].contractId,
      clockCid: clocks[0].contractId,
      observableCids: observables.map(o => o.contractId),
      lifecyclableCid: c
    }
    await ledger.exercise(Service.Lifecycle, svc.lifecycle[0].contractId, arg);
  }
    // navigate("/app/servicing/effects");

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
  const callbackValues = myInstruments.map(c => c.contractId);
  return (
    <SelectionTable title="Instruments" variant={"h3"} headers={headers} values={values} action="Lifecycle" onExecute={lifecycle} callbackValues={callbackValues} />
  );
};
