// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { RepoOfferRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lending/Model";
import { fmt } from "../../util";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { CreateEvent } from "@daml/ledger";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const RepoRequests : React.FC = () => {
  const { getName } = useParties();
  const { contracts: requests, loading: l1 } = useStreamQueries(RepoOfferRequest);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<RepoOfferRequest>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      fmt(c.payload.collateral.amount, 0) + " " + c.payload.collateral.unit.id.unpack,
      c.payload.maturity,
      <DetailButton path={"reporequest/" + c.contractId} />
    ];
  }
  const headers = ["Borrower", "Lender", "Id", "Collateral", "Maturity", "Details"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Repo Requests" variant={"h3"} headers={headers} values={values} />
  );
};
