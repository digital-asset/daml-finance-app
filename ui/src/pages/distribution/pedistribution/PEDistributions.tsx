// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty, useStreamQueries } from "@daml/react";
import { Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";
import { DetailButton } from "../../../components/DetailButton/DetailButton";

export const PEDistributions : React.FC = () => {
  const party = useParty();
  const { getName } = useParties();
  const { loading: l1, contracts: auctions } = useStreamQueries(Auction);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Auction>) : any[] => {
    const path = (party === c.payload.provider || party === c.payload.customer ? "/app/distribution/auctions/" : "/app/distribution/auction/") + c.contractId;
    return [
      c.payload.id,
      getName(c.payload.provider),
      getName(c.payload.customer),
      fmt(c.payload.quantity.amount) + " " + c.payload.quantity.unit.id.unpack,
      fmt(c.payload.floor, 4) + " " + c.payload.currency.id.unpack,
      c.payload.status.tag,
      <DetailButton path={path} />
    ];
  };
  const headers = ["Id", "Agent", "Issuer", "Instrument", "Floor", "Status", "Details"]
  const values : any[] = auctions.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "right", "right", "left", "left"];
  return (
    <HorizontalTable title="Auctions" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
