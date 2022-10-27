// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Observable } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/Observable";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Observables : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, contracts: observables } = useStreamQueries(Observable);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Observable>) : any[] => {
    return [
      getName(c.payload.provider),
      c.payload.id.unpack,
    ];
  }
  const headers = ["Provider", "Observable"]
  const values : any[] = observables.map(createRow);
  return (
    <HorizontalTable title="Observables" variant={"h3"} headers={headers} values={values} />
  );
};
