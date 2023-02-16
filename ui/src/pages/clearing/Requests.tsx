// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { QuoteRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Quoting/Model";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { useHoldings } from "../../context/HoldingContext";
import { ClearingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Model";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Service";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";

export const Requests : React.FC = () => {
  const cls = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();

  const { loading: l1, clearing } = useServices();
  const { loading: l2, holdings } = useHoldings();
  const { loading: l3, contracts: requests } = useStreamQueries(ClearingRequest);
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const approveClearing = async (cr : CreateEvent<ClearingRequest>) => {
    const clearingAccount = accounts.find(c => party === cr.payload.provider && c.payload.accountView.owner === cr.payload.provider)?.key;
    if (!clearing) throw new Error("No clearing service found");
    if (!clearingAccount) throw new Error("No clearing account found");
    const arg = {
      clearingRequestCid: cr.contractId,
      clearingAccount
    }
    await ledger.exercise(Service.ApproveClearing, clearing[0].contractId, arg)
  };

  const clear = async (c : CreateEvent<ClearingRequest>) => {
    await ledger.exercise(ClearingRequest.Clear, c.contractId, {});
  };

  const createRow = (c : CreateEvent<ClearingRequest>) : any[] => {
    const holding = holdings.find(h=> h.contractId === c.payload.holdingCid)!;
    const button = c.payload.counterparty === party
      ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => approveClearing(c)}>Approve</Button>
      : (c.payload.provider === party
        ? <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => clear(c)}>Clear</Button>
        : <></>);
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      getName(c.payload.counterparty),
      holding.payload.amount + " " + holding.payload.instrument.id.unpack,,
      c.payload.customerClearingAccount.id.unpack,
      !!c.payload.counterpartyClearingAccount ? c.payload.counterpartyClearingAccount.id.unpack : "",
      (!!c.payload.counterpartyClearingAccount).toString(),
      button,
    ];
  }
  const headers = ["Clearer", "Requestor", "Counterparty", "Asset", "Requestor Clearing Account", "Counterparty Clearing Account", "Approved", "Action"]
  const values : any[] = requests.map(createRow);
  return (
    <HorizontalTable title="Quote Requests" variant={"h3"} headers={headers} values={values} />
  );
};
