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
import { BilateralAgreement,MarginCall } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Collateral/Model";
import { Button, Accordion, AccordionSummary, AccordionDetails,Typography  } from "@mui/material";
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

export const MarginCalls : React.FC = () => {
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
  const { loading: l2, contracts: agreements } = useStreamQueries(MarginCall);
  const { loading: l3, getFungible } = useHoldings();
  const { loading: l4, tokens, equities,latests, getByCid } = useInstruments();

  // const aggregates = latests.filter(c => c.payload.issuer === party);
  // const aggregate = aggregates.find(c => c.payload.id.unpack === instrumentLabel);
  const collateralInstrument = latests.find(c => c.payload.id.unpack === instrumentLabel);

  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };

  const myServices = collateral.filter(s => s.payload.customer === party);
  // const canDeclareReplacement = !!description && !!effectiveDate && !!currency && !!amount;
  const canCoverMarginCall = !!instrumentLabel;

  if (l1 || l2) return <Spinner />;
  console.log("We got here...");

  const coverMarginCall = async (c : CreateEvent<MarginCall>) => {
    // const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    // if (!service) throw new Error("No auction service found");
    // await ledger.exercise(Service.CreateAuction, service.contractId, { createAuctionRequestCid: c.contractId });
    // await ledger.exercise(BilateralAgreement.MakeMarginCall,c.contractId,{callingParty:party});
    
    // const collateralCid = await getFungible(party, c.payload.margin, c.payload.marginCurrency);
    
    if (!collateralInstrument) return;

    // const x = collateralInstrument.key
    
    // const collateralCid = await getFungible(party, c.payload.margin, collateralInstrument.key);
    const margin = Number(c.payload.margin) / Number(c.payload.haircuts.get(collateralInstrument.key)) ;
    const collateralCid = await getFungible(party, margin.toString(), collateralInstrument.key);
    
    
    await ledger.exercise(MarginCall.CoverMarginCall, c.contractId,{collateralCid: collateralCid});
    navigate("/app/custody/assets");
  }

  const createRow = (c : CreateEvent<MarginCall>) : any[] => {
    return [
      c.payload.id,
      c.payload.marginCurrency.id.unpack,
      getName(c.payload.customers._1),
      fmt(c.payload.thresholds._1, 0),
      fmt(c.payload.minTransfers._1, 0),
      fmt(c.payload.independentAmounts._1, 0),
      getName(c.payload.customers._2),
      fmt(c.payload.thresholds._2, 0),
      fmt(c.payload.minTransfers._2, 0),
      fmt(c.payload.independentAmounts._2, 0),
      fmt(c.payload.margin, 0),
      // <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => coverMarginCall(c)}>cover</Button>,
      <Accordion expanded={expanded === "Cover Margin Call"} onChange={() => toggle("Cover Margin Call")}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography gutterBottom variant="h6" component="h2">Cover Margin Call</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* <TextInput    label="Description"       value={description}   setValue={setDescription} /> */}
        {/* <DateInput    label="Effective Date"    value={effectiveDate} setValue={setEffectiveDate} /> */}
        <SelectInput  label="Collateral Asset" value={instrumentLabel}      setValue={setInstrumentLabel} values={toValues(latests)} />
        {/* <TextInput    label="Per Unit Amount"   value={amount}        setValue={setAmount} /> */}
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canCoverMarginCall} onClick={() => coverMarginCall(c)}>Cover</Button>
      </AccordionDetails>
      </Accordion>
    ];
  }
  const headers = [
    "Agreement", 
    "Currency", 
    "A", 
    "Threshold", 
    "MTA", 
    "Ind. Amt", 
    "B", 
    "Threshold", 
    "MTA", 
    "Ind. Amt",
    "Margin"]
  const values : any[] = agreements.map(createRow);
  const alignment : Alignment[] = [
    "left", 
    "left", 
    "left", 
    "right", 
    "right", 
    "right", 
    "left", 
    "right", 
    "right", 
    "right"];
  return (
    <HorizontalTable title="MarginCalls" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
