// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import useStyles from "../styles";
import { PriceRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Model";
import { fmt } from "../../util";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { CreateEvent } from "@daml/ledger";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { Button } from "@mui/material";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const { getName } = useParties();
  const { contracts: requests, loading: l1 } = useStreamQueries(PriceRequest);
  const party = useParty();
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<PriceRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.instrument.id.unpack,
      c.payload.oracleId,
      c.payload.requested,
      (c.payload.provider == party) ? <DetailButton path={c.contractId} /> : <></>
    ];
  }
  const headers = ["Provider", "Customer", "Instrument", "Mapped Id", "Requested", "Fulfill/Reject"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Pricing Requests" variant={"h3"} headers={headers} values={values} />
  );
};
