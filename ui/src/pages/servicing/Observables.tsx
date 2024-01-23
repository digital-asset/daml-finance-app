// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { Observation } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/Numeric/Observation";
import { fmt } from "../../util";

export const Observables : React.FC = () => {
  const { getName } = useParties();

  const { loading: l1, contracts: observables } = useStreamQueries(Observation);
  if (l1) return <Spinner />;

  const createRows = (c : CreateEvent<Observation>) : any[] => {
    return c.payload.observations.entriesArray().map(d => [
      getName(c.payload.provider),
      c.payload.id.unpack,
      d[0],
      fmt(d[1], 4),
    ]);
  }
  const headers = ["Provider", "Observable", "Date", "Value"];
  const values : any[] = observables.flatMap(createRows);
  return (
    <HorizontalTable title="Observables" variant={"h3"} headers={headers} values={values} />
  );
};
