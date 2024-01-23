// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { fmt } from "../../util";
import { Trade } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Confirmation/Model";
import { CreateEvent } from "@daml/ledger";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Confirmation/Service";
import { Factory } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Factory";

export const Confirmations : React.FC = () => {
  const cls = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, confirmation } = useServices();
  const { loading: l2, contracts: trades } = useStreamQueries(Trade);
  const { loading: l3, contracts: holdingFactories } = useStreamQueries(Factory);
  if (l1 || l2 || l3) return <Spinner />;

  const confirmTrade = async (c : CreateEvent<Trade>) => {
    if (!confirmation) throw new Error("No confirmation service found");
    const arg = {
      ctrl: party,
      tradeCid : c.contractId,
    }
    await ledger.exercise(Service.ConfirmTrade, confirmation[0].contractId, arg);
  };

  const bookTrade = async (c : CreateEvent<Trade>) => {
    if (!confirmation) throw new Error("No confirmation service found");
    if (!holdingFactories) throw new Error("No holding factory found");
    const arg = {
      holdingFactoryCid : holdingFactories[0].contractId,
    }
    await ledger.exercise(Trade.Book, c.contractId, arg);
  };

  const createRow = (c : CreateEvent<Trade>) : any[] => {
    const canConfirm = (c.payload.seller === party || c.payload.buyer === party) && !c.payload.confirmed.includes(party);
    const canBook = (c.payload.operator === party && c.payload.status === "Confirmed");
    const action = canConfirm
      ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => confirmTrade(c)}>Affirm</Button>
      : (canBook
        ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => bookTrade(c)}>Book</Button>
        : <></>);
    return [
      getName(c.payload.seller),
      getName(c.payload.buyer),
      c.payload.id,
      c.payload.instrument.id.unpack,
      fmt(c.payload.amount),
      c.payload.confirmed.map(getName).join(", "),
      c.payload.status,
      action,
      <DetailButton path={c.contractId} />
    ];
  };

  const headers = ["Seller", "Buyer", "Id", "Instrument", "Amount", "Confirmations", "Status", "Action", "Details"]
  const values : any[] = trades.map(a => a).sort((a, b) => a.payload.id.localeCompare(b.payload.id)).map(createRow);
  return (
    <HorizontalTable title="Confirmations" variant={"h3"} headers={headers} values={values} />
  );
};
