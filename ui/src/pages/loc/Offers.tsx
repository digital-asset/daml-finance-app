// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { fmt } from "../../util";
import { useServices } from "../../context/ServiceContext";
import { Service as LettersOfCredit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Service";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { LoCOffer } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Model";

export const Offers : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, loc } = useServices();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: offers } = useStreamQueries(LoCOffer);
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);
  if (l1 || l2 || l3 || l4) return <Spinner />;

  const customerServices = loc.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;

  const acceptLoCOffer = async (offer : CreateEvent<LoCOffer>) => {
    const buyerAccount = accounts.find(c => c.payload.accountView.owner === party && c.payload.accountView.custodian === offer.payload.provider)?.key;
    if (!buyerAccount) throw new Error("No suitable account found");
    const arg = {
      loCOfferCid: offer.contractId,
      account: buyerAccount
    };
    await ledger.exercise(LettersOfCredit.AcceptLoC, customerServices[0].contractId, arg);
    navigate("/app/loc/locs");
  };

  const createRow = (c : CreateEvent<LoCOffer>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      fmt(c.payload.requested.amount, 0) + " " + c.payload.requested.unit.id.unpack,
      c.payload.maturity,
      fmt(c.payload.granted.amount, 0) + " " + c.payload.granted.unit.id.unpack,
      isCustomer ? <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => acceptLoCOffer(c)}>Accept</Button> : <></>
    ];
  }
  const headers = ["Buyer", "Issuer", "Id", "Requested", "Maturity", "Granted", "Action"]
  const values : any[] = offers.map(createRow);
  return (
    <HorizontalTable title="Borrow Offers" variant={"h3"} headers={headers} values={values} />
  );
};
