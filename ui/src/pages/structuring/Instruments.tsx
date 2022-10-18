// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Sheet } from "../../components/Table/HorizontalTable";
import { DetailButton } from "../../components/DetailButton/DetailButton";

export const Instruments : React.FC = () => {
  const { getName } = useParties();
  const { loading: l1, groups } = useInstruments();
  if (l1) return <Spinner />;

  const headers = ["Depository", "Issuer", "Id", "Description", "Versions", "Latest", "Details"]
  const values : any[] = groups.map((c, i) => [getName(c.depository), getName(c.issuer), c.id.unpack, c.description, c.versions.length, c.latest.payload.validAsOf, <DetailButton path={c.key} />]);
  return (
    <Sheet title="Instruments" variant={"h3"} headers={headers} values={values} />
  );
};
