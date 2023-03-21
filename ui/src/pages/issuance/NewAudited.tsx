// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Button, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Service as BackToBack } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/BackToBack/Service";
import { Service as IssuanceAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Auto/Service";
import { Service as Issuance } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Issuance/Service";
import { Message } from "../../components/Message/Message";
import { TextInput } from "../../components/Form/TextInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { ContractId } from "@daml/types";
import { Audit } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Audit/Model";

export const NewAudited : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ isB2B, setIsB2B ] = useState(false);
  const [ amount, setAmount ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { loading: l1, backToBack, issuance, issuanceAuto } = useServices();
  const { loading: l2, latests } = useInstruments();
  const { contracts: accounts, loading: l3 } = useStreamQueries(Reference);
  const {contracts: audits, loading: l4} = useStreamQueries(Audit);
  

  const aggregates = latests.filter(c => c.payload.issuer === party);
  const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);

  if (l1 || l2 || l3) return <Spinner />;
  if (!issuance) return (<Message text="No issuance service found" />);

  const myB2BServices = backToBack.filter(s => s.payload.customer === party);
  const hasB2B = myB2BServices.length > 0;
  const canRequest = !!instrumentLabel && !!aggregate && !!amount;
  const hasAuto = issuanceAuto.length > 0;

  const requestIssuance = async () => {
    // TODO: Accounts should be selectable
    if (hasB2B && isB2B) {
      const customerAccount = accounts.find(c => c.payload.accountView.custodian === party && c.payload.accountView.owner === party);
      const providerAccount = accounts.find(c => c.payload.accountView.custodian === myB2BServices[0].payload.provider && c.payload.accountView.owner === myB2BServices[0].payload.provider);
      if (!aggregate || !customerAccount || !providerAccount) return;
      const arg = {
        id: { unpack : id },
        description: id,
        quantity: { amount: amount, unit: aggregate.key },
        customerAccount: customerAccount.key,
        providerAccount: providerAccount.key
      };
      await ledger.exercise(BackToBack.CreateIssuance, myB2BServices[0].contractId, arg);
      navigate("/app/issuance/issuances");
    } else {
      const myAutoSvc = issuanceAuto.filter(s => s.payload.customer === party)[0];
      const mySvc = issuance.filter(s => s.payload.customer === party)[0];
      const custodian = hasAuto ? myAutoSvc.payload.provider : mySvc.payload.provider;
      const account = accounts.find(c => c.payload.accountView.custodian === custodian && c.payload.accountView.owner === party);
      
      const splitarr = instrumentLabel.split(" ")
      const instrumentId = splitarr[0]
      const auditCid = audits.find(c=> c.payload.quantity.unit.id.unpack === instrumentId );
     
      if (!aggregate || !account || !auditCid) return;
      const arg = {
        id: { unpack : id },
        description: id,
        quantity: { amount: amount, unit: aggregate.key },
        account: account.key,
        auditCid : auditCid.contractId,
      };
      if (hasAuto) await ledger.exercise(IssuanceAuto.RequestAndCreateAuditedIssuance, myAutoSvc.contractId, arg);
      else await ledger.exercise(Issuance.RequestCreateAuditedIssuance, mySvc.contractId, arg);
      navigate("/app/auditedIssuance/issuances");
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>New Issuance</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              {/* {audits.length>0 && <TextInput    label="Id"          value={id}              setValue={setId} />
} */}
              <TextInput    label="Id"          value={id}              setValue={setId} />
              <SelectInput  label="Instrument"  value={instrumentLabel} setValue={setInstrumentLabel} values={toValues(aggregates)} />
              <TextInput    label="Amount"      value={amount}          setValue={setAmount} />
              {hasB2B && <FormGroup><FormControlLabel control={<Checkbox checked={isB2B} onChange={e => setIsB2B(e.target.checked)}/>} label="Issue back-to-back" /></FormGroup>}
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestIssuance}>{hasAuto ? "Issue" : "Request Issuance"}</Button>
            </Paper>
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </Grid>
    </Grid>
  );
};
