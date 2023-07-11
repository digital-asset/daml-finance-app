// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { singleton } from "../../util";

export const Observables : React.FC = () => {
  const ledger = useLedger();
  const party = useParty();
  const { getName } = useParties();
  const [ rows, setRows ] = useState<any[]>([]);

  const { loading: l1, contracts: observables } = useStreamQueries(NumericObservable);

  useEffect(() => {
    if (l1) return;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const createRow = async (c : CreateEvent<NumericObservable>) : Promise<any[]> => {
      const [obs, ] = await ledger.exercise(NumericObservable.Observe, c.contractId, { actors: singleton(party), t: today.toISOString() });
      return [
        getName(c.payload.provider),
        c.payload.id.unpack,
        obs
      ];
    }
    const createRows = async () => {
      const r = [];
      for (var i = 0; i < observables.length; i++) {
        const row = await createRow(observables[i]);
        r.push(row);
      }
      setRows(r);
    }
    createRows();
  }, [l1, observables, getName, ledger, party]);

  if (l1) return <Spinner />;

  const headers = ["Provider", "Observable", "Value (Today)"]
  return (
    <HorizontalTable title="Observables" variant={"h3"} headers={headers} values={rows} />
  );
};
