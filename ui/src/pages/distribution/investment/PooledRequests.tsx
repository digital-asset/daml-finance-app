// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServicesContext";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";
import { Service as FundService } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Service";
import { Fund, PooledInvestmentRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Model";
import { Button } from "@mui/material";
import useStyles from "../../styles";
import { NumericObservable } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/NumericObservable";
import { Factory } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Factory";

export const PooledRequests : React.FC = () => {
  const classes = useStyles();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, fund } = useServices();
  const { loading: l2, contracts: funds } = useStreamQueries(Fund);
  const { loading: l3, contracts: requests } = useStreamQueries(PooledInvestmentRequest);
  const { loading: l4, contracts: observables } = useStreamQueries(NumericObservable);
  const { loading: l5, contracts: factories } = useStreamQueries(Factory);
  if (l1 || l2 || l3 || l4 || l5) return <Spinner />;

  const myServices = fund.filter(s => s.payload.provider === party);
  const canFulFill = myServices.length > 0;

  const fulfillRequest = async (pir : CreateEvent<PooledInvestmentRequest>) => {
    const service = myServices[0];
    if (!service) throw new Error("No fund service found");
    const fundId = pir.payload.fundId.unpack;
    const fundContract = funds.find(c => c.payload.id.unpack === fundId);
    if (!fundContract) throw new Error("Fund [" + fundId + "] not found");
    const observable = observables.find(c => c.payload.id.unpack === "NAV_" + fundId + "_USD");
    if (!observable) throw new Error("NAV observable for [" + fundId + "] not found");
    const factory = factories[0];
    if (!factory) throw new Error("Settlement factory not found");
    const arg = {
      pooledInvestmentRequestCid: pir.contractId,
      fundCid: fundContract.contractId,
      navObservableCid: observable.contractId,
      settlementFactoryCid: factory.contractId
    };
    await ledger.exercise(FundService.FulfillPooledInvestmentRequest, service.contractId, arg);
  }

  const createRow = (c : CreateEvent<PooledInvestmentRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.requestId.unpack,
      c.payload.asOfDate.substring(0, 10),
      fmt(c.payload.quantity.amount, 0),
      c.payload.quantity.unit.id.unpack,
      c.payload.fundId.unpack,
      c.payload.investmentRequestCids.length,
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={!canFulFill} onClick={() => fulfillRequest(c)}>Fulfill</Button>
    ];
  };
  const headers = ["Portfolio Manager", "Asset Manager", "RequestId", "AsOfDate", "Amount", "Currency", "Fund", "# Requests", "Action"];
  const values : any[] = requests.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "left", "left", "right", "left"];
  return (
    <HorizontalTable title="Investment Requests" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
