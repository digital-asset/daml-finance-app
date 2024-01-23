// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { fmt } from "../../util";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { CreateEvent } from "@daml/ledger";

export const Issuances : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, contracts: issuances } = useStreamQueries(Issuance);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Issuance>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id.unpack,
      c.payload.description,
      fmt(c.payload.quantity.amount, 0),
      c.payload.quantity.unit.id.unpack,
      <DetailButton path={"/app/issuance/issuances/" + c.contractId} />
    ];
  }
  const headers = ["Custodian", "Issuer", "Id", "Description", "Amount", "Instrument", "Details"]
  const values : any[] = issuances.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "left", "left"];
  return (
    <HorizontalTable title="Issuances" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
