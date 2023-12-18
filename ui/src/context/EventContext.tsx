// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useStreamQueries } from "@daml/react";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { Event as Distribution } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event/Distribution";
import { Event as Replacement } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event/Replacement";
import { Event as Time } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event/Time";

type EventState = {
  loading : boolean
  events  : EventAggregate[]
};

export type EventAggregate = CreateEvent<Event> & {
  time         : CreateEvent<Time> | undefined
  distribution : CreateEvent<Distribution> | undefined
  replacement  : CreateEvent<Replacement> | undefined
}

const empty = {
  loading: true,
  events: [],
};

const EventContext = React.createContext<EventState>(empty);

export const EventProvider : React.FC = ({ children }) => {

  const { loading: l1,  contracts: baseEvents }         = useStreamQueries(Event);
  const { loading: l2,  contracts: timeEvents }         = useStreamQueries(Time);
  const { loading: l3,  contracts: distributionEvents } = useStreamQueries(Distribution);
  const { loading: l4,  contracts: replacementEvents }  = useStreamQueries(Replacement);
  const loading = l1 || l2 || l3 || l4;

  if (loading) {
    return (
      <EventContext.Provider value={empty}>
          {children}
      </EventContext.Provider>
    );
  } else {
    const timeEventsByCid         : Map<string, CreateEvent<Time>>          = new Map(timeEvents.map(c => [c.contractId, c]));
    const distributionEventsByCid : Map<string, CreateEvent<Distribution>>  = new Map(distributionEvents.map(c => [c.contractId, c]));
    const replacementEventsByCid  : Map<string, CreateEvent<Replacement>>   = new Map(replacementEvents.map(c => [c.contractId, c]));

    const events : EventAggregate[] = baseEvents.map(c => ({
      ...c,
      time: timeEventsByCid.get(c.contractId),
      distribution: distributionEventsByCid.get(c.contractId),
      replacement: replacementEventsByCid.get(c.contractId)
    }));

    const value = {
      loading,
      events
    };

    return (
      <EventContext.Provider value={value}>
          {children}
      </EventContext.Provider>
    );
  }
};

export const useEvents = () => {
  return React.useContext(EventContext);
}
