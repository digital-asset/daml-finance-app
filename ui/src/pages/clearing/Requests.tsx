// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { useHoldings } from "../../context/HoldingContext";
import { ClearingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Model";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { fmt } from "../../util";
import { useNavigate } from "react-router-dom";

export const Requests : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();

  const { loading: l1, clearing } = useServices();
  const { loading: l2, holdings } = useHoldings();
  const { loading: l3, contracts: requests } = useStreamQueries(ClearingRequest);
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const approveClearing = async (cr : CreateEvent<ClearingRequest>) => {
    const clearingAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === cr.payload.provider)?.key;
    if (!clearing) throw new Error("No clearing service found");
    if (!clearingAccount) throw new Error("No clearing account found");
    const arg = {
      clearingAccount
    }
    await ledger.exercise(ClearingRequest.Approve, cr.contractId, arg);
  };

  const clear = async (c : CreateEvent<ClearingRequest>) => {
    await ledger.exercise(ClearingRequest.Clear, c.contractId, {});
    navigate("/app/clearing/trades");
  };

  const createRow = (c : CreateEvent<ClearingRequest>) : any[] => {
    const holding = holdings.find(h=> h.contractId === c.payload.holdingCid)!;
    const button = c.payload.counterparty === party
      ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" disabled={!!c.payload.counterpartyClearingAccount} onClick={() => approveClearing(c)}>Approve</Button>
      : (c.payload.provider === party
        ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => clear(c)}>Clear</Button>
        : <></>);
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      getName(c.payload.counterparty),
      fmt(holding.payload.amount) + " " + holding.payload.instrument.id.unpack,
      c.payload.customerClearingAccount.id.unpack,
      !!c.payload.counterpartyClearingAccount ? c.payload.counterpartyClearingAccount.id.unpack : "",
      (!!c.payload.counterpartyClearingAccount).toString(),
      button,
    ];
  }
  const headers = ["Clearer", "Requestor", "Counterparty", "Asset", "Requestor Clearing Account", "Counterparty Clearing Account", "Approved", "Action"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Clearing Requests" variant={"h3"} headers={headers} values={values} />
  );
};
