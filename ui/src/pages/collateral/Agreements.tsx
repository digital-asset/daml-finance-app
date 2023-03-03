import React from "react";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Alignment, HorizontalTable } from "../../components/Table/HorizontalTable";
import { useHoldings } from "../../context/HoldingContext";
import { ClearingRequest } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Clearing/Model";
import { BilateralAgreement } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Collateral/Model";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useServices } from "../../context/ServiceContext";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { fmt } from "../../util";
import { useNavigate } from "react-router-dom";

export const Agreements : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();

  const { loading: l1, collateral } = useServices();
  const { loading: l2, contracts: agreements } = useStreamQueries(BilateralAgreement);
  if (l1 || l2) return <Spinner />;

  const createRow = (c : CreateEvent<BilateralAgreement>) : any[] => {
    return [
      c.payload.id,
      c.payload.marginCurrency.id.unpack,
      getName(c.payload.customers._1),
      fmt(c.payload.thresholds._1, 0),
      fmt(c.payload.minTansfer._1, 0),
      fmt(c.payload.independentAmount._1, 0),
      getName(c.payload.customers._2),
      fmt(c.payload.thresholds._2, 0),
      fmt(c.payload.minTansfer._2, 0),
      fmt(c.payload.independentAmount._2, 0),
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => {} }>Call Margin</Button>
    ];
  }
  const headers = ["Agreement", "Currency", "A", "Threshold", "MTA", "Ind. Amt", "B", "Threshold", "MTA", "Ind. Amt"]
  const values : any[] = agreements.map(createRow);
  const alignment : Alignment[] = ["left", "left", "left", "right", "right", "right", "left", "right", "right", "right"];
  return (
    <HorizontalTable title="Funds" variant={"h3"} headers={headers} values={values} alignment={alignment} />
  );
};
