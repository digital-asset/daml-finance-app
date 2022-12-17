// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../../components/Spinner/Spinner";
import { dedup, fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServicesContext";
import { InvestmentRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Investment/Model";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";
import { SelectionTable } from "../../../components/Table/SelectionTable";
import { ContractId } from "@daml/types";
import { Service as FundService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Service";
import { useHoldings } from "../../../context/HoldingContext";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { Fund } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Model";

export const Requests : React.FC = () => {
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, fund } = useServices();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: funds } = useStreamQueries(Fund);
  const { loading: l4, contracts: requests } = useStreamQueries(InvestmentRequest);
  if (l1 || l2 || l3 || l4) return <Spinner />;

  const myServices = fund.filter(s => s.payload.customer === party);
  const canPool = myServices.length > 0;

  const poolRequests = async (cs : CreateEvent<InvestmentRequest>[]) => {
    const service = myServices[0];
    if (!service) throw new Error("No fund service found");
    const total = cs.reduce((a, b) => a + parseFloat(b.payload.quantity.amount), 0);
    const fundIds = dedup(cs.map(c => c.payload.fundId.unpack));
    if (fundIds.length > 1) throw new Error("Investment requests for more than one fund selected");
    const fundContract = funds.find(c => c.payload.id.unpack === fundIds[0]);
    if (!fundContract) throw new Error("Fund [" + fundIds[0] + "] not found");
    const cashCid = await getFungible(party, total, cs[0].payload.quantity.unit);
    const today = new Date().toISOString().substring(0, 10);
    const requestId = "REQ/" + fundContract.payload.id.unpack + "/" + today;
    const arg = {
      requestId: { unpack: requestId },
      asOfDate: today,
      fundCid: fundContract.contractId,
      cashCid: cashCid as string as ContractId<Transferable>,
      investmentRequestCids: cs.map(c => c.contractId)
    };
    await ledger.exercise(FundService.PoolInvestmentRequests, service.contractId, arg);
    navigate("../pooledrequests");
  }

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
  const callbackValues = requests.map(c => c as any);
  return (
    <>
      {!canPool && <HorizontalTable title="Investment Requests" variant={"h3"} headers={headers} values={values} alignment={alignment} />}
      {canPool && <SelectionTable title="Investment Requests" variant={"h3"} headers={headers} values={values} action="Pool" onExecute={poolRequests} callbackValues={callbackValues} />}
    </>
  );
};
