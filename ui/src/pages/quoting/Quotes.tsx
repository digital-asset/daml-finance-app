// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { Quote } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Model";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Service";
import { useNavigate } from "react-router-dom";

export const Quotes : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, quoting, settlement } = useServices();
  const { loading: l2, contracts: listings } = useStreamQueries(Quote);
  if (l1 || l2) return <Spinner />;

  const acceptQuote = async (quote : CreateEvent<Quote>) => {
    if (!quoting) throw new Error("No quoting service found");
    if (!settlement) throw new Error("No settlement service found");
    const arg = {
      quoteCid: quote.contractId,
      settlementServiceCid: settlement[0].contractId
    };
    await ledger.exercise(Service.AcceptQuote, quoting[0].contractId, arg);
    navigate("/app/settlement/batches");
  };

  const createRow = (c : CreateEvent<Quote>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id.unpack,
      c.payload.side,
      c.payload.quantity.amount + " " + c.payload.quantity.unit.id.unpack,
      c.payload.price.amount + " " + c.payload.price.unit.id.unpack,
      c.payload.clearer,
      c.payload.customer === party ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => acceptQuote(c)}>Accept</Button> : <></>,
      <DetailButton path={c.contractId} />
    ];
  }
  const headers = ["Dealer", "Buyer", "Id", "Side", "Asset", "Price", "Clearer", "Action", "Details"]
  const values : any[] = listings.map(createRow);
  return (
    <HorizontalTable title="Markets" variant={"h3"} headers={headers} values={values} />
  );
};
