// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { CreateAuctionRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServiceContext";
import { Fund, InvestmentRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Investment/Model";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, investment } = useServices();
  const { loading: l2, contracts: requests } = useStreamQueries(InvestmentRequest);
  if (l1 || l2) return <Spinner />;

  const providerServices = investment.filter(s => s.payload.provider === party);
  // const createAuction = async (c : CreateEvent<CreateAuctionRequest>) => {
  //   const service = providerServices.find(s => s.payload.customer === c.payload.customer);
  //   if (!service) throw new Error("No auction service found");
  //   await ledger.exercise(Service.CreateAuction, service.contractId, { createAuctionRequestCid: c.contractId });
  //   navigate("/app/distribution/auctions");
  // }

  const createRow = (c : CreateEvent<InvestmentRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.requestId.unpack,
      fmt(c.payload.quantity.amount, 0),
      c.payload.quantity.unit.id.unpack,
      c.payload.fundId.unpack,
      getName(c.payload.manager)
    ];
  }
  const headers = ["Asset Manager", "Investor", "RequestId", "Amount", "Currency", "Fund", "Portfolio Manager"]
  const values : any[] = requests.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "right", "left", "left", "left"];
  return (
    <HorizontalTable title="Investment Requests" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
