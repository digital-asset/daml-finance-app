// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const Markets : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, contracts: listings } = useStreamQueries(Listing);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Listing>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id,
      c.payload.tradedInstrument.id.unpack,
      c.payload.quotedInstrument.id.unpack,
      <DetailButton path={c.contractId} />
    ];
  }
  const headers = ["Exchange", "Issuer", "Id", "Traded Asset", "Quoted Asset", "Details"]
  const values : any[] = listings.map(createRow);
  return (
    <HorizontalTable title="Markets" variant={"h3"} headers={headers} values={values} />
  );
};
