// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { QuoteRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Model";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { fmt } from "../../util";

export const Requests : React.FC = () => {
  const { getName } = useParties();

  const { loading: l1, contracts: requests } = useStreamQueries(QuoteRequest);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<QuoteRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id.unpack,
      c.payload.side,
      fmt(c.payload.quantity.amount) + " " + c.payload.quantity.unit.id.unpack,
      <DetailButton path={c.contractId} />
    ];
  }
  const headers = ["Dealer", "Buyer", "Id", "Side", "Asset", "Details"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Quote Requests" variant={"h3"} headers={headers} values={values} />
  );
};
