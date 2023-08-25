// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { LoC } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Model";
import { fmt } from "../../util";
import { useServices } from "../../context/ServiceContext";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const LoCs : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, lending } = useServices();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: locs } = useStreamQueries(LoC);
  if (l1 || l2 || l3) return <Spinner />;

  const customerServices = lending.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;

  const createRow = (c : CreateEvent<LoC>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      getName (c.payload.beneficiary),
      c.payload.id,
      fmt(c.payload.granted.amount, 0) + " " + c.payload.granted.unit.id.unpack,
      c.payload.maturity
    ];
  }
  const headers = ["Buyer", "Issuer", "Beneficiary", "Id", "Quantity", "Maturity"]
  const values : any[] = locs.map(createRow);
  return (
    <HorizontalTable title="Live Trades" variant={"h3"} headers={headers} values={values} />
  );
};
