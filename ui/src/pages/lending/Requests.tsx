// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { BorrowOfferRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { fmt } from "../../util";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { CreateEvent } from "@daml/ledger";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const Requests : React.FC = () => {
  const { getName } = useParties();
  const { contracts: requests, loading: l1 } = useStreamQueries(BorrowOfferRequest);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<BorrowOfferRequest>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      fmt(c.payload.borrowed.amount, 0) + " " + c.payload.borrowed.unit.id.unpack,
      c.payload.maturity,
      <DetailButton path={"request/" + c.contractId} />
    ];
  }
  const headers = ["Borrower", "Lender", "Id", "Borrowed", "Maturity", "Details"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Borrow Requests" variant={"h3"} headers={headers} values={values} />
  );
};
