// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useParty, useStreamQueries } from "@daml/react";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { fmt } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { Alignment, HorizontalTable } from "../../../components/Table/HorizontalTable";
import { Fund } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Fund/Model";
import { useServices } from "../../../context/ServicesContext";

export const Funds : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();

  const { loading: l1, investment } = useServices();
  const { loading: l2, contracts: requests } = useStreamQueries(Fund);
  if (l1 || l2) return <Spinner />;
  const isInvestor = !!investment.services.find(c => c.payload.customer === party);

  const createRow = (c : CreateEvent<Fund>) : any[] => {
    return [
      getName(c.payload.custodian),
      getName(c.payload.manager),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.currency.id.unpack,
      fmt(c.payload.totalUnits, 0),
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={!isInvestor} onClick={() => navigate("../new/investment")}>Invest</Button>
    ];
  }
  const headers = ["Custodian", "Manager", "FundId", "Description", "Currency", "Total Units", "Action"]
  const values : any[] = requests.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "left", "right", "left"];
  return (
    <HorizontalTable title="Funds" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
