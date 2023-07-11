// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { InstrumentGroup, useInstruments } from "../../context/InstrumentContext";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const Instruments : React.FC = () => {
  const { getName, getParty } = useParties();
  const { loading: l1, groups } = useInstruments();
  if (l1) return <Spinner />;

  const createRow = (c : InstrumentGroup) : any[] => {
    return [
      getName(c.depository),
      getName(c.issuer),
      c.id.unpack,
      c.description,
      c.versions.length,
      c.latest.payload.validAsOf,
      <DetailButton path={c.key} />
    ];
  }
  const op = getParty("Operator");
  const headers = ["Depository", "Issuer", "Id", "Description", "Versions", "Latest", "Details"]
  const values : any[] = groups.filter(g => g.issuer !== op).map(createRow);
  return (
    <HorizontalTable title="Trade Input" variant={"h3"} headers={headers} values={values} />
  );
};
