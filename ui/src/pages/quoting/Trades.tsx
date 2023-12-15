// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";
import { HoldingAggregate, useHoldings } from "../../context/HoldingContext";
import { useInstruments } from "../../context/InstrumentContext";
import { fmt } from "../../util";

export const Trades : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, holdings } = useHoldings();
  const { loading: l2, interestRateSwaps } = useInstruments();
  if (l1 || l2) return <Spinner />;

  const swapIds = interestRateSwaps.map(c => c.payload.id.unpack);
  const filtered = holdings.filter(c => swapIds.includes(c.payload.instrument.id.unpack));

  const createRow = (c : HoldingAggregate) : any[] => {
    const swap = interestRateSwaps.find(irs => irs.payload.id.unpack === c.payload.instrument.id.unpack)!.interestRateSwap!.payload.interestRate;
    return [
      getName(c.payload.account.owner),
      getName(c.payload.account.custodian),
      fmt(c.payload.amount),
      swap.currency.id.unpack,
      fmt(parseFloat(swap.fixRate) * 100, 2) + "%",
      swap.floatingRate.referenceRateId,
      <DetailButton path={c.contractId} />
    ];
  };

  const headers = ["Party", "Counterparty", "Notional", "Currency", "FixedRate", "FloatingRate", "Details"]
  const values : any[] = filtered.map(createRow);
  return (
    <HorizontalTable title="Trades" variant={"h3"} headers={headers} values={values} />
  );
};
