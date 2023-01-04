// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { Listing } from "@daml.js/daml-finance-app-interface-listing/lib/Daml/Finance/App/Interface/Listing/Listing";
import { Service as Auto } from "@daml.js/daml-finance-app-interface-listing/lib/Daml/Finance/App/Interface/Listing/Auto";
import { Service } from "@daml.js/daml-finance-app-interface-listing/lib/Daml/Finance/App/Interface/Listing/Service";

export const Listings : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, listing, listingAuto } = useServices();
  const { loading: l2, contracts: listings } = useStreamQueries(Listing);
  if (l1 || l2) return <Spinner />;

  const requestDelisting = async (c : CreateEvent<Listing>) => {
    const arg = { listingCid: c.contractId }
    // TODO: Assumes single service
    const svc = listing.getService(c.payload.provider, party);
    const auto = listingAuto.getService(c.payload.provider, party);
    if (!svc) throw new Error("No listing service found for provider [" + c.payload.provider + "] and customer [" + party + "]");
    if (!!auto) await ledger.exercise(Auto.RequestAndDelist, auto.service.contractId, arg);
    else await ledger.exercise(Service.RequestDelisting, svc.service.contractId, arg);
  };

  const createRow = (c : CreateEvent<Listing>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.tradedInstrument.id.unpack,
      c.payload.quotedInstrument.id.unpack,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.customer} onClick={() => requestDelisting(c)}>Delist</Button>
    ];
  };
  const headers = ["Exchange", "Issuer", "Id", "Description", "Instrument", "Currency", "Action"]
  const values : any[] = listings.map(createRow);
  return (
    <HorizontalTable title="Listings" variant={"h3"} headers={headers} values={values} />
  );
};
