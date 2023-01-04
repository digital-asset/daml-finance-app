// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Button, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { useServices } from "../../context/ServicesContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as BackToBack } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/BackToBack";
import { Service as IssuanceAuto } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/Auto";
import { Service as Issuance } from "@daml.js/daml-finance-app-interface-issuance/lib/Daml/Finance/App/Interface/Issuance/Service";
import { Message } from "../../components/Message/Message";
import { TextInput } from "../../components/Form/TextInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { fmt } from "../../util";
import { CenteredForm } from "../../components/CenteredForm/CenteredForm";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, backToBack, issuance, issuanceAuto } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, contracts: accounts } = useStreamQueries(Reference);

  const aggregates = latests.filter(c => c.payload.issuer === party);
  const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);

  if (l1 || l2 || l3) return <Spinner />;
  if (issuance.services.length === 0) return (<Message text="No issuance service found" />);

  const myB2BServices = backToBack.services.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!instrumentLabel && !!aggregate && !!amount;

  const requestIssue = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
      const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
      if (!aggregate || !customerAccount || !providerAccount) return;
      const arg = {
        issuanceId: { unpack : uuidv4() },
        description: "Issuance of " + fmt(amount, 0) + " " + aggregate.key.id.unpack,
        quantity: { amount: amount, unit: aggregate.key },
        customerAccount: customerAccount.key,
        providerAccount: providerAccount.key
      };
      await ledger.exercise(BackToBack.CreateIssuance, myB2BServices[0].service.contractId, arg);
      navigate("/app/issuance/issuances");
    } else {
      if (!aggregate) throw new Error("Aggregate with label [" + instrumentLabel + "] not found");
      const account = accounts.find(c => c.payload.accountView.custodian === aggregate.payload.depository && c.payload.accountView.owner === party);
      if (!account) throw new Error("No account found for custodian " + aggregate.payload.depository + " and owner " + party);
      const arg = {
        issuanceId: { unpack : uuidv4() },
        description: "Issuance of " + fmt(amount, 0) + " " + aggregate.key.id.unpack,
        quantity: { amount: amount, unit: aggregate.key },
        account: account.key,
      };
      // TODO: Assumes depository is custodian
      const svc = issuance.getService(aggregate.payload.depository, party);
      const auto = issuanceAuto.getService(aggregate.payload.depository, party);
      if (!svc) throw new Error("No issuance service found for provider [" + aggregate.payload.depository + "] and customer [" + party + "]");
      if (!!auto) await ledger.exercise(IssuanceAuto.RequestAndIssue, auto.service.contractId, arg);
      else await ledger.exercise(Issuance.RequestIssue, svc.service.contractId, arg);
      navigate("/app/issuance/issuances");
    }
  }

  return (
    <CenteredForm title= "New Issuance">
      <SelectInput  label="Instrument"  value={instrumentLabel} setValue={setInstrumentLabel} values={toValues(aggregates)} />
      <TextInput    label="Amount"      value={amount}          setValue={setAmount} />
      {hasB2B && <FormGroup><FormControlLabel control={<Checkbox checked={isB2B} onChange={e => setIsB2B(e.target.checked)}/>} label="Issue back-to-back" /></FormGroup>}
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestIssue}>Issue</Button>
    </CenteredForm>
  );
};
