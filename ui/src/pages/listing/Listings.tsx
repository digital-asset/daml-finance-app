// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Service";
import { Service as AutoService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Auto/Service";
import { Listing } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Listing/Model";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Listings : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, listing, listingAuto } = useServices();
  const { loading: l2, contracts: listings } = useStreamQueries(Listing);
  if (l1 || l2) return <Spinner />;

  const myServices = listing.filter(s => s.payload.customer === party);
  const myAutoServices = listingAuto.filter(s => s.payload.customer === party);

  const requestDelisting = async (c : CreateEvent<Listing>) => {
    if (myServices.length === 0) throw new Error("No listing service found");
    if (myAutoServices.length > 0) {
      await ledger.exercise(AutoService.RequestAndDeleteListing, myAutoServices[0].contractId, { listingCid: c.contractId });
    } else {
      await ledger.exercise(Service.RequestDeleteListing, myServices[0].contractId, { listingCid: c.contractId });
    }
  }

  const createRow = (c : CreateEvent<Listing>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.id,
      c.payload.tradedInstrument.id.unpack,
      c.payload.quotedInstrument.id.unpack,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.customer} onClick={() => requestDelisting(c)}>Delist</Button>
    ];
  }
  const headers = ["Exchange", "Issuer", "Id", "Traded Asset", "Quoted Asset", "Action"]
  const values : any[] = listings.map(createRow);
  return (
    <HorizontalTable title="Listings" variant={"h3"} headers={headers} values={values} />
  );
};
