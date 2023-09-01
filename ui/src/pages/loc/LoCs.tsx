// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button, Link } from "@mui/material";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { LoC } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/LettersOfCredit/Model";
import { fmt } from "../../util";
import { useServices } from "../../context/ServiceContext";
import { CreateEvent } from "@daml/ledger";
import { useHoldings } from "../../context/HoldingContext";
import { ContractId } from "@daml/types";
import { Transferable } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Transferable";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { useUploadedFiles } from './UploadedFilesContext';

export const LoCs : React.FC = () => {
  const classes = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName } = useParties();
  const { loading: l1, lending } = useServices();
  const { loading: l2, getFungible } = useHoldings();
  const { loading: l3, contracts: locs } = useStreamQueries(LoC);
  const { uploadedFiles } = useUploadedFiles();
  if (l1 || l2 || l3) return <Spinner />;
  console.log(Object.keys(uploadedFiles).length)
  const customerServices = lending.filter(c => c.payload.customer === party);
  const isCustomer = customerServices.length > 0;
  interface PreloadedFiles {
    [key: string]: string;
  }
  const preloadedFiles:PreloadedFiles = {
    'Terms-A' : '/documents/preloaded/Terms-A.pdf',
    'Terms-B' : '/documents/preloaded/Terms-B.pdf'
  }
  
  
  const getLinkProps = (file : string | File) => {
    return {
      href: typeof file === 'string' ? file : URL.createObjectURL(file),
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  };
  const createRow = (c : CreateEvent<LoC>) : any[] => {
    
    return [
      
      getName(c.payload.customer),
      getName(c.payload.provider),
      getName (c.payload.beneficiary),
      c.payload.id,
      fmt(c.payload.granted.amount, 0) + " " + c.payload.granted.unit.id.unpack,
      c.payload.maturity,
      !preloadedFiles[c.payload.terms] ? !uploadedFiles[c.payload.terms] ?
        c.payload.terms :
        <Link {...getLinkProps(uploadedFiles[c.payload.terms])}> Terms</Link>:
        <Link {...getLinkProps(preloadedFiles[c.payload.terms])}> Terms</Link>
    ];
  }
  const headers = ["Buyer", "Issuer", "Beneficiary", "Id", "Quantity", "Maturity"]
  const values : any[] = locs.map(createRow);
  return (
    <HorizontalTable title="Live Trades" variant={"h3"} headers={headers} values={values} />
  );
};
