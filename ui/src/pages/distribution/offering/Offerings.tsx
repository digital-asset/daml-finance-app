// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useStreamQueries } from "@daml/react";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Offering } from "@daml.js/daml-finance-app-interface-distribution/lib/Daml/Finance/App/Interface/Distribution/Subscription/Offering";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { DetailButton } from "../../../components/DetailButton/DetailButton";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";

export const Offerings : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, contracts: offerings } = useStreamQueries(Offering);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Offering>) : any[] => {
    return [
      c.payload.id.unpack,
      getName(c.payload.provider),
      getName(c.payload.issuer),
      fmt(c.payload.asset.amount) + " " + c.payload.asset.unit.id.unpack,
      fmt(c.payload.price.amount, 2) + " " + c.payload.price.unit.id.unpack,
      c.payload.status,
      <DetailButton path={"/app/distribution/subscriptions/" + c.contractId} />
    ];
  }
  const headers = ["Id", "Agent", "Issuer", "Instrument", "Price", "Status", "Details"]
  const values : any[] = offerings.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "right", "right", "left", "left"];
  return (
    <HorizontalTable title="Offerings" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
