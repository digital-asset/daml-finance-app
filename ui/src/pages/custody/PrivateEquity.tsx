// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useLedger, useParty, useStreamQueries, } from "@daml/react";
import { Effect } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Effect";
// import {ElectionEffect} from "@daml.js/a28aabd498cb348737849ac4f4bd26357a7d81a096267f81e8a7ffc7cc7c1dd4/lib/Daml/Finance"
// import {ElectionEffect} from "@daml.js/039aa24eacce8fc1108f77fe814d9336ab2dcf2e35c41932cc66c5f86fc99548/lib/Daml/Finance" 

import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { Fungible } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Fungible";
import { Claim } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Claim";
import { fmt } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { useHoldings } from "../../context/HoldingContext";
import { useServices } from "../../context/ServiceContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { Accordion, AccordionDetails, AccordionSummary, Button, TextField, Typography } from "@mui/material";
import useStyles from "../styles";
import { useInstruments } from "../../context/InstrumentContext";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { TextInput } from "../../components/Form/TextInput";
import classnames from "classnames";
import { ExpandMore } from "@mui/icons-material";
import { Service as Lifecycle } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { CreateEvent } from "@daml/ledger";
import { dedup, keyEquals, shorten } from "../../util";
export type HoldingsProps = {
}

type PositionEntry = {
  custodian : string
  owner : string
  instrument : string
  version : string
  position : number
  locked : number
  available : number
  commitment: number
}

const positionEntryCmp = (p1: PositionEntry, p2: PositionEntry) => {
  if (p1.instrument < p2.instrument) return -1;
  if (p1.instrument > p2.instrument) return 1;
  else {
    if (p1.custodian < p2.custodian) return -1; 
    if (p1.custodian > p2.custodian) return 1;
    else return 0;
  }
}

const Holdings : React.FC<HoldingsProps> = ({ }) => {
  const party = useParty();
  const ledger = useLedger();
  const navigate = useNavigate();
  const { getNames } = useParties();
  //const [ expanded, setExpanded ] = useState("");
  const [ owner, setOwner ] = useState("");
  const [ custodian, setCustodian ] = useState("");
  const [ instrument, setInstrument ] = useState("");
  const [ callAmount, setCallAmount ] = useState("");
  const { getName } = useParties();
  const { loading: l1, holdings,getFungible } = useHoldings();
  const { loading: l2, lifecycle } = useServices();
  const { loading: l3, tokens, equities, getByCid } = useInstruments();
  const { loading: l4, contracts: effects } = useStreamQueries(Effect);
  const { loading: l5, contracts: claimRules } = useStreamQueries(Claim);
  const classes = useStyles();
  if (l1 || l2 || l3) return <Spinner />;
  const svc = lifecycle.find(c => c.payload.customer === party);
  const svcList = lifecycle.filter (c => c.payload.customer === party);


  const toggle = (cust : string, own : string, inst: string) => {
    if (cust === custodian && own === owner && inst === instrument) {
      setCustodian("");
      setOwner(""); 
      setInstrument("");
      setCallAmount("");
    }
    else { 
      setCustodian(cust);
      setOwner(own); 
      setInstrument(inst);
      setCallAmount("");
    }
  };

  const declareCapitalCall = async () => {
    const holding = holdings.find(h => h.payload.account.owner === owner && h.payload.account.custodian === custodian && h.payload.instrument.id.unpack === instrument);
    const usd = tokens.find(h => h.payload.id.unpack === "USD");
    const svcInv = svcList.find(c => c.payload.provider === custodian)
    if (!svcInv) throw new Error("Couldn't find lifecycle service");
    if (!holding) throw new Error("Couldn't find Instrument "+instrument);
    if (!usd) throw new Error("Could not find USD!!");
    const arg = {
      id: { unpack: uuidv4() },
      description: "Capital Call on " +instrument,
      electionTime: new Date().toISOString(),
      amount: callAmount, 
      commitment: holding.payload.instrument,
      currency: usd.key
    };  
    await ledger.exercise(Lifecycle.DeclareCapitalCall, svcInv.contractId, arg);
    // navigate("/app/servicing/effects");
  };

  const claimElectionEffect  = async(effect : CreateEvent<Effect>) => {
    
    const holding = holdings.find(c => effect.payload.providers.map.has(c.payload.account.custodian) && effect.payload.targetInstrument.id.unpack === c.payload.instrument.id.unpack); 
    // console.log(holding?.payload.account.custodian)
    console.log(holding?.payload.instrument.id.unpack)
    
    if (!holding) throw new Error("Couldn't find holding");
    const svcInv = svcList.find(c => effect.payload.providers.map.has(c.payload.provider) && c.payload.provider != c.payload.customer)
    if (!svcInv) throw new Error("Couldn't find lifecycle service");
    const [amountCid,] = await ledger.exercise(Lifecycle.GetEffectAmount, svcInv.contractId, {effectICid :effect.contractId, holdingCid : holding?.contractId}  )
    // const holdingSplit = holdings.find(c=> c.contractId == amount._2)
    const holdingSplit = await ledger.fetch (Base, amountCid._2)
    if (!!holdingSplit){

      // const [ { splitCids, }, ] = await ledger.exercise(Fungible.Split, holding.contractId, { amounts: [ qty.toString() ] });
      // const holdingCids = [holding.contractId]
      const holdingCids = [amountCid._2]
      const claimRule = claimRules.find(c => c.payload.providers.map.has(holdingSplit?.payload.account.custodian) && c.payload.claimers.map.has(holdingSplit?.payload.account.owner));
      const arg = {
        claimer: party,
        holdingCids,
        effectCid: effect.contractId,
        batchId: { unpack: "SETTLE-"  + effect.payload.targetInstrument.id.unpack + "-" + effect.payload.id.unpack }
      };
      if (!!claimRule){
        await ledger.exercise(Claim.ClaimEffect, claimRule.contractId, arg);
      }
    }
    
  }

  const filtered = holdings.filter(c => c.payload.account.owner === party && c.payload.instrument.id.unpack.match("-COMMITMENT") );
  const liabilities = holdings.filter(c => c.payload.account.custodian === party);

  var entries : PositionEntry[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const a = filtered[i];
    const entry = entries.find(e => e.custodian === a.payload.account.custodian && e.owner === a.payload.account.owner && e.instrument === a.payload.instrument.id.unpack && e.version === a.payload.instrument.version);
    const qty = parseFloat(a.payload.amount);
    const isLocked = !!a.payload.lock;
    if (!!entry) {
      entry.position += qty;
      entry.locked += isLocked ? qty : 0;
      entry.available += isLocked ? 0 : qty;
    } else {
      entries.push({
        custodian: a.payload.account.custodian,
        owner: a.payload.account.owner,
        instrument: a.payload.instrument.id.unpack,
        version: a.payload.instrument.version,
        position: qty,
        locked: isLocked ? qty : 0,
        available: isLocked ? 0 : qty, 
        commitment: 0
      });
    }
  }

  for (let i = 0; i < liabilities.length; i++) {
    const l = liabilities[i];
    const entry = entries.find(e => e.custodian === l.payload.account.owner && e.owner === l.payload.account.custodian && l.payload.instrument.id.unpack === e.instrument.split("-")[0])
    const qty = parseFloat(l.payload.amount) 
    if (!!entry) {
      entry.commitment += qty
    }
  }

  entries.sort(positionEntryCmp)

  const createRow = (e : PositionEntry) : any[] => {
    return [
      getName(e.custodian),
      getName(e.owner),
      e.instrument,
      e.version,
      fmt(e.commitment),
      fmt(e.position, 0),
      fmt(e.locked, 0),
      fmt(e.available, 0),
      <Accordion expanded={custodian === e.custodian && owner === e.owner && instrument === e.instrument} onChange={() => toggle(e.custodian,  e.owner, e.instrument)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography gutterBottom variant="h6" component="h3">Capital</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextInput label="Amount in USD"   value={callAmount}        setValue={setCallAmount} />
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" onClick={()=>declareCapitalCall()}>call</Button>
      </AccordionDetails>
      </Accordion>
    ];
  }
  const headers = ["Obligor", "Beneficiary", "Instrument", "Version", "Initial", "Total Remaining", "Locked Remaining", "Available Remaining", "Capital"]
  const values : any[] = entries.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "left", "right", "right", "right", "right", "left"];
  
  const createRowEffect = (c : CreateEvent<Effect>) : any[] => {
    return [
      getNames(c.payload.providers),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.targetInstrument.id.unpack + " (v" + shorten(c.payload.targetInstrument.version) + ")",
      !!c.payload.producedInstrument ? c.payload.targetInstrument.id.unpack + " (v" + shorten(c.payload.producedInstrument.version) + ")" : "",
      <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" onClick={()=>claimElectionEffect(c)}>claim effect</Button>,
     
    ];
  }
  const headersEffect = ["Providers", "Id", "Description", "Target", "Produced", "Positions", ];
  const valuesEffect : any[] = effects.map(createRowEffect);
  const callbackValues = effects.map(c => c as any);
  const alignmentEffect : Alignment[] = ["left", "left", "left", "left", "right", "right", "right", "right", "left"];
  
  
  return (
    <>
    <HorizontalTable title={ "Commitments"} variant={"h3"} headers={headers} values={values} alignment={alignment} />
    <HorizontalTable title={ "Effects"} variant={"h3"} headers={headersEffect} values={valuesEffect} alignment={alignmentEffect} />
    </>
  );
};

export const PrivateEquity : React.FC = () => {
  return <Holdings />;
};

