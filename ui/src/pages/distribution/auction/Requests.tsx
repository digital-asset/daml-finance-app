// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { CreateAuctionRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/CreateAuctionRequest";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Distribution/Auction/Service";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServicesContext";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, auction } = useServices();
  const { loading: l2, contracts: requests } = useStreamQueries(CreateAuctionRequest);
  if (l1 || l2) return <Spinner />;

  const createAuction = async (c : CreateEvent<CreateAuctionRequest>) => {
    const svc = auction.getService(party, c.payload.customer);
    if (!svc) throw new Error("No auction service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.CreateAuction, svc.service.contractId, { createAuctionRequestCid: c.contractId });
    navigate("/app/distribution/auctions");
  }

  const createRow = (c : CreateEvent<CreateAuctionRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.auctionId.unpack,
      c.payload.description,
      fmt(c.payload.quantity.amount, 0) + " " + c.payload.quantity.unit.id.unpack,
      c.payload.currency.id.unpack,
      c.payload.floor + " " + c.payload.currency.id.unpack,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.provider} onClick={() => createAuction(c)}>Create</Button>
    ];
  }
  const headers = ["Agent", "Issuer", "Auction Id", "Description", "Asset", "Currency", "Floor Price", "Action"]
  const values : any[] = requests.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "left", "right", "left"];
  return (
    <HorizontalTable title="Auction Requests" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
