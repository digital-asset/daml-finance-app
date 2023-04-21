// import React from "react";
import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { useHoldings } from "../../context/HoldingContext";
import { ClearingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Model";
import { BilateralAgreement,CallForDelivery,CallForReturn } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Collateral/Model";
import { Button, Accordion, AccordionSummary, AccordionDetails,Typography, Grid  } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { TextInput } from "../../components/Form/TextInput";
import { DateInput } from "../../components/Form/DateInput";
import { SelectInput, toValues } from "../../components/Form/SelectInput";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { fmt } from "../../util";
import { useNavigate } from "react-router-dom";
import { useInstruments } from "../../context/InstrumentContext";
// import { useHoldings } from "../../../context/HoldingContext";
import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";

export const LockedAssets : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const [ expanded, setExpanded ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ effectiveDate, setEffectiveDate ] = useState<Date | null>(null);
  const [ currency, setCurrency ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  
  const { loading: l1, collateral } = useServices();
  const { loading: l2, contracts: callForDeliveries } = useStreamQueries(CallForDelivery);
  const { loading: l3, getFungible,holdings } = useHoldings();
  const { loading: l4, tokens, equities,latests, getByCid } = useInstruments();
  const { loading: l5, contracts: callForReturns } = useStreamQueries(CallForReturn);
  
  const filteredHoldings = holdings.filter(c=> !!c.payload.lock);
  

  // const aggregates = latests.filter(c => c.payload.issuer === party);
  // const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);
  const collateralInstrument = latests.find(c => c.payload.id.unpack === instrumentLabel);

  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };

  const myServices = collateral.filter(s => s.payload.customer === party);
  // const canDeclareReplacement = !!description && !!effectiveDate && !!currency && !!amount;


  if (l1 || l2) return <Spinner />;
  console.log("We got here...");




  const createRow = (c : CreateEvent<Base>) : any[] => {
    return [
      c.payload.lock?.context.map.keys().next().value,
      getName(c.payload.account.owner),
      getName(String(c.payload.lock?.lockers.map.keys().next().value)),
      c.payload.amount,
      c.payload.instrument.id.unpack,
      

    ];
  }
  const headers = [
    "Reference",
    "owner", 
    "Locker", 
    "amount", 
    "currency"]
  const filteredHoldingsA = filteredHoldings.filter(c=> c.payload.account.owner == party)
  const filteredHoldingsB = filteredHoldings.filter(c=> c.payload.account.owner != party)
  
  const valuesA : any[] = filteredHoldingsA.map(createRow);
  const valuesB : any[] = filteredHoldingsB.map(createRow);
  
  const alignment : Alignment[] = [
    "left", 
    "left", 
    "left", 
    "left", 
    "right"];

  return (
    <Grid style={{ display: 'flex',gap: '20px' }}>

    
    <HorizontalTable title="My Assets" variant={"h3"} headers={headers} values={valuesA} alignment={alignment} />

    <HorizontalTable title="Others Assets" variant={"h3"} headers={headers} values={valuesB} alignment={alignment} />
    </Grid>
  );
};
