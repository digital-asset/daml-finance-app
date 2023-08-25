// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from "react";
import classnames from "classnames";
import { Button, Accordion, AccordionSummary, AccordionDetails,Typography, Grid  } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { LoC } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Model";
import { Invoice, Receipt, Dispute, ClaimedDispute } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/MutualTrade/Model";
import { Service as MutualTrade } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/MutualTrade/Service";
import { fmt } from "../../util";
import { useServices } from "../../context/ServiceContext";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import { useInstruments } from "../../context/InstrumentContext";
import { Base as Holding } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { useAccounts } from "../../context/AccountContext";

export const TradeFinance : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const { getParty } = useParties();
  const ledger = useLedger();
  const { getName } = useParties();
  const [ expanded, setExpanded ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const { loading: l1, mutualTrade,custody } = useServices();
  const { loading: l2, getFungible,holdings } = useHoldings();
  const { loading: l3, contracts: invoices } = useStreamQueries(Invoice);
  const { loading: l4, tokens, equities,latests, getByCid } = useInstruments();
  const { loading: l5, contracts: receipts } = useStreamQueries(Receipt);
  const { loading: l6, contracts: disputes } = useStreamQueries(Dispute);
  const { loading: l7, contracts: events } = useStreamQueries(Event);
  const { loading: l8, contracts: locs } = useStreamQueries(LoC);
  const { loading: l9, accounts } = useAccounts();
  const { loading: l10, contracts: claimedDisputes } = useStreamQueries(ClaimedDispute);
  if (l1 || l2 || l3) return <Spinner />;
  const cashRecAccount = accounts.find(c=> c.custodian == getParty("CentralBank") && c.owner == party);
  const secRecAccount = accounts.find(c=> c.custodian == getParty("Issuer") && c.owner == getParty("Issuer"));

  const customerServices = mutualTrade.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;
  const providedServices = mutualTrade.filter(c => c.payload.provider === party);
  const isProvider = providedServices.length > 0
  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };
  const selectedInstrument = latests.find(c => c.payload.id.unpack === instrumentLabel);

  // Function to Transfer/send SBLC
  const doPayOrDispute = async (c : CreateEvent<Invoice>) => {
    
    if (!selectedInstrument) return;
    const holdingCid = await getFungible(party, c.payload.requested.amount, selectedInstrument.key);

    const arg = {
      paymentRequestCid: c.contractId, 
      // paymentDate : c.payload.dueDate,
      holdingCid : holdingCid as string as ContractId<Holding>
      

    };
    
    await ledger.exercise(MutualTrade.PayOrDispute, providedServices[0].contractId, arg);
    // navigate("/app/custody/assets");
  }

  // Function to make Claim

  const doMakeClaim = async (c : CreateEvent<Dispute>) => {
    const locCurrent = locs.find(loc => loc.payload.sblc.id.unpack == c.payload.send.unit.id.unpack)
    console.log(c.payload.send.unit.id.unpack)
    if (!locCurrent) return;
    console.log("2")
    const custodySvc = custody.find(svc=> svc.payload.provider == locCurrent?.payload.provider)
    if (!custodySvc) return;
    console.log("3")
    const holdingsFiltered = holdings.filter(h => h.payload.instrument.id.unpack == c.payload.send.unit.id.unpack)
    const holdingCids = holdingsFiltered.map(h=> h.contractId)
    const cashHoldingsIssuer = holdings.find(h=> h.payload.account.owner == locCurrent.payload.provider && h.payload.amount >= locCurrent.payload.granted.amount && h.payload.instrument.id.unpack == locCurrent.payload.requested.unit.id.unpack)
    console.log(holdingCids.length)
    if (!cashHoldingsIssuer) return;
    console.log(holdings.length)
    if (!cashRecAccount) return;
    console.log("5")
    if (!secRecAccount) return;
    console.log("6")
    const arg = {
      locCid : locCurrent.contractId,//ContractId LetterOfCredit.LoC
      eventCid : events[0].contractId,//ContractId Event.I
      custodySvcCid :custodySvc.contractId, //ContractId Custody.Service
      holdingCids : holdingCids,//[ContractId Holding.I]
      cashCid : cashHoldingsIssuer.contractId,
      cashRecAccount : cashRecAccount,
      secRecAccount : secRecAccount,
      

    };
    await ledger.exercise(Dispute.Claim, c.contractId, arg);
    console.log("7")

  }

  const createRow = (c : CreateEvent<Invoice>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      c.payload.paymentFor,
      c.payload.dueDate,
      fmt(c.payload.requested.amount, 0) + " " + c.payload.requested.unit.id.unpack,
      // <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!isProvider} onClick={() => doSendSBLC(c)}>Send SBLC</Button>,

      <Accordion expanded={expanded === c.payload.id} onChange={() => toggle(c.payload.id)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography gutterBottom variant="h6" component="h2">Pay/Dispute</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SelectInput  label="" value={instrumentLabel}      setValue={setInstrumentLabel} values={toValues(latests)} />
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!isProvider} onClick={() => doPayOrDispute(c)}> {instrumentLabel=="" ? "Pay/Dispute" : instrumentLabel.includes("USD")? "Pay" : "Dispute" }</Button>
      </AccordionDetails>
      </Accordion>
    ];
  }
  const headers = ["Seller", "Buyer", "Id","PaymentFor","DueDate", "Quantity"]
  const values : any[] = invoices.map(createRow);
  
  const createRowReceipts = (c : CreateEvent<Receipt>) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      c.payload.paymentFor,
      c.payload.createdOn.slice(0,10),
      fmt(c.payload.paid.amount, 0) + " " + c.payload.paid.unit.id.unpack,
    ];
  }
  const headersReceipts = ["Seller", "Buyer", "Id","PaymentFor","PaidOn", "Quantity"]
  const valuesReceipts : any[] = receipts.map(createRowReceipts);
  
  const createRowDisputes = (c : CreateEvent<Dispute> | CreateEvent<ClaimedDispute> ) : any[] => {
    return [
      getName(c.payload.customer),
      getName(c.payload.provider),
      c.payload.id,
      c.payload.paymentFor,
      c.payload.createdOn.slice(0,10),
      fmt(c.payload.send.amount, 0) + " " + c.payload.send.unit.id.unpack,
      c.templateId == Dispute.templateId ? <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!isCustomer} onClick={() => doMakeClaim(c)}>Claim</Button> : "claimed"
    ];
  }
  const headersDisputes = ["Seller", "Buyer", "Id","PaymentFor","SendOn", "Quantity", "ClaimStatus"]
  // const valuesDisputes : any[] = disputes.map(createRowDisputes);
  const allDisputes = [...disputes, 
  ...claimedDisputes]
  const valuesDisputes : any[] = allDisputes.map(createRowDisputes);
  
  return (
    // !!paymentRequests.length && 
    <>
    <HorizontalTable title="Invoices" variant={"h3"} headers={headers} values={values} />
    <HorizontalTable title="Disputes" variant={"h3"} headers={headersDisputes} values={valuesDisputes} />
    <HorizontalTable title="Receipts" variant={"h3"} headers={headersReceipts} values={valuesReceipts} />
    
    </>
  );
};
