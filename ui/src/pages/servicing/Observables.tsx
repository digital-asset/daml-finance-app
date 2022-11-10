// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Observable } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/Observable";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { singleton } from "../../util";

export const Observables : React.FC = () => {
  const ledger = useLedger();
  const party = useParty();
  const { getName } = useParties();
  const [ rows, setRows ] = useState<any[]>([]);

  const { loading: l1, contracts: observables } = useStreamQueries(Observable);

  useEffect(() => {
    console.log("asdf");
    if (l1) return;
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    const createRow = async (c : CreateEvent<Observable>) : Promise<any[]> => {
      const [obs, ] = await ledger.exercise(Observable.Observe, c.contractId, { actors: singleton(party), t: today.toISOString() });
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
