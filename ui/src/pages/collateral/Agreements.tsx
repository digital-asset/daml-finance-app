// import React from "react";
import React, { useEffect, useState } from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { useHoldings } from "../../context/HoldingContext";
import { ClearingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Model";
import { BilateralAgreement } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Collateral/Model";
// import { Button } from "@mui/material";
import { Button, Accordion, AccordionSummary, AccordionDetails,Typography  } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { TextInput } from "../../components/Form/TextInput";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { fmt } from "../../util";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";

export const Agreements : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const [ expanded, setExpanded ] = useState("");
  const [ margin, setMargin ] = useState("");

  const { loading: l1, collateral } = useServices();
  const { loading: l2, contracts: agreements } = useStreamQueries(BilateralAgreement);

  const toggle = (label : string) => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  };

  const myServices = collateral.filter(s => s.payload.customer === party);
  const canMarginCall = !!margin;

  if (l1 || l2) return <Spinner />;
  console.log("We got here...");

  const makeCall = async (c : CreateEvent<BilateralAgreement>) => {
    // const service = providerServices.find(s => s.payload.customer === c.payload.customer);
    // if (!service) throw new Error("No auction service found");
    // await ledger.exercise(Service.CreateAuction, service.contractId, { createAuctionRequestCid: c.contractId });
    // await ledger.exercise(BilateralAgreement.MakeMarginCall,c.contractId,{callingParty:party});
    await ledger.exercise(BilateralAgreement.MakeMarginCall,c.contractId,{callingParty:party, margin:margin});
    navigate("/app/collateral/margincalls");
  }

  const createRow = (c : CreateEvent<BilateralAgreement>) : any[] => {
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
      // <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => makeCall(c)}>Call</Button>,
      <Accordion expanded={expanded === c.payload.id} onChange={() => toggle(c.payload.id)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography gutterBottom variant="h6" component="h2">Make Margin Call</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextInput    label="Amount in USD"   value={margin}        setValue={setMargin} />
        <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canMarginCall} onClick={() => makeCall(c)}>call</Button>
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
    "Ind. Amt"]
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
    <HorizontalTable title="Agreements" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
