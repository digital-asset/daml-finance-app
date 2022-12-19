// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Service";
import { Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/Listing";
import { ListingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/ListingRequest";
import { DelistingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Interface/Listing/DelistingRequest";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();

  const { loading: l1, listing } = useServices();
  const { loading: l2, contracts: listingRequests } = useStreamQueries(ListingRequest);
  const { loading: l3, contracts: delistingRequests } = useStreamQueries(DelistingRequest);
  const { loading: l4, contracts: listings } = useStreamQueries(Listing);
  if (l1 || l2 || l3 || l4) return <Spinner />;

  const list = async (c : CreateEvent<ListingRequest>) => {
    const svc = listing.getService(party, c.payload.customer);
    if (!svc) throw new Error("No listing service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.List, svc.service.contractId, { listingRequestCid: c.contractId });
    navigate("/app/listing/listings");
  }

  const delist = async (c : CreateEvent<DelistingRequest>) => {
    const svc = listing.getService(party, c.payload.customer);
    if (!svc) throw new Error("No listing service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.Delist, svc.service.contractId, { delistingRequestCid: c.contractId });
    navigate("/app/listing/listings");
  }

  const headers = ["Provider", "Customer", "Id", "Description", "Traded Instrument", "Quoted Instrument", "Action"]
  const createListingRow = (c : CreateEvent<ListingRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.listingId.unpack,
      c.payload.description,
      c.payload.tradedInstrument.id.unpack,
      c.payload.quotedInstrument.id.unpack,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.provider} onClick={() => list(c)}>List</Button>
    ];
  };
  const createDelistingRow = (c : CreateEvent<DelistingRequest>) : any[] => {
    const listing = listings.find(l => l.contractId === c.payload.listingCid)!;
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      listing.payload.id.unpack,
      listing.payload.description,
      listing.payload.tradedInstrument.id.unpack,
      listing.payload.quotedInstrument.id.unpack,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.provider} onClick={() => delist(c)}>Delist</Button>
    ];
  };
  const valuesListing : any[] = listingRequests.map(createListingRow);
  const valuesDelisting : any[] = delistingRequests.map(createDelistingRow);
  return (
    <>
      <HorizontalTable title="Listing Requests" variant={"h3"} headers={headers} values={valuesListing} />
      <HorizontalTable title="Delisting Requests" variant={"h3"} headers={headers} values={valuesDelisting} />
    </>
  );
};
