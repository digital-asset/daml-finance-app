// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Service";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { InstrumentAggregate, useInstruments } from "../../context/InstrumentContext";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { useNavigate } from "react-router-dom";

export const Pricing : React.FC = () => {
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();

  const { loading: l1, oracle } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, contracts: numericObservables } = useStreamQueries(NumericObservable);

  if (l1 || l2 || l3) return <Spinner />;

  const myInstruments = latests.filter(a =>
    (!!a.claim || !!a.equity));

  const requestPriceAll = async (cs : any[]) => {
    const requestPriceOne = async (c : InstrumentAggregate) => {
      const arg = {
        instrument: c.key,
      }
      await ledger.exercise(Service.CreatePriceRequest, oracle[0].contractId, arg);
    };
    await Promise.all(cs.map(c => requestPriceOne(c as InstrumentAggregate)));
    navigate("/app/servicing/requests")
  };

  const createRow = (c : InstrumentAggregate) : any[] => {
    return [
      getName(c.payload.depository),
      getName(c.payload.issuer),
      c.payload.id.unpack,
      c.payload.description,
    ];
  }
  const headers = ["Depository", "Issuer", "Id", "Description"];
  const values : any[] = myInstruments.map(createRow);
  return (
    <SelectionTable title="Instruments" variant={"h3"} headers={headers} values={values} action="Request Price" onExecute={requestPriceAll} callbackValues={myInstruments} />
  );
};
