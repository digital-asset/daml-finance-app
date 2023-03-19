// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty } from "@daml/react";
import { Typography, Grid, Paper, Button, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
// import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
// import { Service as BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Service as AuditAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Audit/Auto/Service";
import { Service as Audit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Audit/Service";
import { Message } from "../../components/Message/Message";
import { TextInput } from "../../components/Form/TextInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, backToBack, audit, auditAuto } = useServices();
  const { loading: l2, latests } = useInstruments();
  // const { contracts: accounts, loading: l3 } = useStreamQueries(Reference);

  const aggregates = latests.filter(c => c.payload.issuer === party);
  const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);

  if (l1 || l2 ) return <Spinner />;
  if (!audit) return (<Message text="No audit service found" />);

  const myB2BServices = backToBack.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!instrumentLabel && !!aggregate && !!amount;
  const hasAuto = auditAuto.length > 0;

  // const requestAudit = async () => {
  //   // TODO: Accounts should be selectable
  //   if (hasB2B && isB2B) {
  //     const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
  //     const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
  //     if (!aggregate || !customerAccount || !providerAccount) return;
  //     const arg = {
  //       id: { unpack : id },
  //       description: id,
  //       quantity: { amount: amount, unit: aggregate.key },
  //       customerAccount: customerAccount.key,
  //       providerAccount: providerAccount.key
  //     };
  //     await ledger.exercise(BackToBack.CreateAudit, myB2BServices[0].contractId, arg);
  //     navigate("/app/audit/audits");
  //   } else {
  //     const myAutoSvc = auditAuto.filter(s => s.payload.customer === party)[0];
  //     const mySvc = audit.filter(s => s.payload.customer === party)[0];
  //     const custodian = hasAuto ? myAutoSvc.payload.provider : mySvc.payload.provider;
  //     const account = accounts.find(c => c.payload.accountView.custodian === custodian && c.payload.accountView.owner === party);
  //     if (!aggregate || !account) return;
  //     const arg = {
  //       id: { unpack : id },
  //       description: id,
  //       quantity: { amount: amount, unit: aggregate.key },
  //       account: account.key,
  //     };
  //     if (hasAuto) await ledger.exercise(AuditAuto.RequestAndCreateAudit, myAutoSvc.contractId, arg);
  //     else await ledger.exercise(Audit.RequestCreateAudit, mySvc.contractId, arg);
  //     navigate("/app/audit/audits");
  //   }
  // }

  const requestAudit = async () => {
    const myAutoSvc = auditAuto.filter(s => s.payload.customer === party)[0];
    const mySvc = audit.filter(s => s.payload.customer === party)[0];
    // const auditor = hasAuto ? myAutoSvc.payload.provider : mySvc.payload.provider;
    if (!aggregate) return; 
    const arg = {
      id: { unpack : id },
      description: id,
      quantity: { amount: amount, unit: aggregate.key },
    };
    if (hasAuto) await ledger.exercise(AuditAuto.RequestAndCreateAudit, myAutoSvc.contractId, arg);
    else await ledger.exercise(Audit.RequestCreateAudit, mySvc.contractId, arg);
    navigate("/app/audit/audits");
  }




  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>New Audit</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              <TextInput    label="Id"          value={id}              setValue={setId} />
              <SelectInput  label="Instrument"  value={instrumentLabel} setValue={setInstrumentLabel} values={toValues(aggregates)} />
              <TextInput    label="Amount"      value={amount}          setValue={setAmount} />
              {hasB2B && <FormGroup><FormControlLabel control={<Checkbox checked={isB2B} onChange={e => setIsB2B(e.target.checked)}/>} label="Issue back-to-back" /></FormGroup>}
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestAudit}>{hasAuto ? "Issue" : "Request Audit"}</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
