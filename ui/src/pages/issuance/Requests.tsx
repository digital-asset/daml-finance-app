// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Service } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/Service";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServicesContext";
import { IssueRequest } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/IssueRequest";
import { DeissueRequest } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/DeissueRequest";
import { fmt } from "../../util";
import { useHoldings } from "../../context/HoldingContext";
import { Issuance } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/Issuance";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Requests : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, issuance } = useServices();
  const { loading: l2, holdings } = useHoldings();
  const { loading: l3, contracts: issuances } = useStreamQueries(Issuance);
  const { loading: l4, contracts: issueRequests } = useStreamQueries(IssueRequest);
  const { loading: l5, contracts: deissueRequests } = useStreamQueries(DeissueRequest);
  if (l1 || l2 || l3 || l4 || l5) return <Spinner />;

  const issue = async (c : CreateEvent<IssueRequest>) => {
    const svc = issuance.getService(party, c.payload.customer);
    if (!svc) throw new Error("No issuance service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.Issue, svc.service.contractId, { issueRequestCid: c.contractId });
    navigate("/app/issuance/issuances");
  }

  const deissue = async (c : CreateEvent<DeissueRequest>) => {
    const svc = issuance.getService(party, c.payload.customer);
    if (!svc) throw new Error("No issuance service found for provider " + party + " and customer " + c.payload.customer);
    await ledger.exercise(Service.Deissue, svc.service.contractId, { deissueRequestCid: c.contractId });
    navigate("/app/issuance/issuances");
  }

  const headers = ["Provider", "Customer", "Id", "Description", "Instrument", "Amount", "Action"]
  const createIssueRow = (c : CreateEvent<IssueRequest>) : any[] => {
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.issuanceId,
      c.payload.description,
      c.payload.quantity.unit.id.unpack,
      fmt(c.payload.quantity.amount, 0),
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.provider} onClick={() => issue(c)}>Issue</Button>
    ];
  };
  const createDeissueRow = (c : CreateEvent<DeissueRequest>) : any[] => {
    const issuance = issuances.find(i => i.payload.id.unpack === c.payload.issuanceId.unpack)!;
    const holding = holdings.find(h => h.contractId === c.payload.holdingCid)!;
    return [
      getName(c.payload.provider),
      getName(c.payload.customer),
      c.payload.issuanceId,
      issuance.payload.description,
      holding.payload.instrument.id.unpack,
      fmt(holding.payload.amount, 0),
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={party !== c.payload.provider} onClick={() => deissue(c)}>Deissue</Button>
    ];
  };
  const valuesIssuance : any[] = issueRequests.map(createIssueRow);
  const valuesDeissuance : any[] = deissueRequests.map(createDeissueRow);
  return (
    <>
      <HorizontalTable title="Issuance Requests" variant={"h3"} headers={headers} values={valuesIssuance} />
      <HorizontalTable title="Deissuance Requests" variant={"h3"} headers={headers} values={valuesDeissuance} />
    </>
  );
};
