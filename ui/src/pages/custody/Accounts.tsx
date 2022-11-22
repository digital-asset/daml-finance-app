// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid } from "@mui/material";
import { useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { Account } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

export const Accounts : React.FC = () => {
  const party = useParty();
  const { getName } = useParties();
  const { contracts: accounts, loading: l1 } = useStreamQueries(Account);
  if (l1) return <Spinner />;

  const createRow = (c : CreateEvent<Account>) : any[] => {
    return [
      getName(c.payload.custodian),
      getName(c.payload.owner),
      c.payload.id.unpack,
      c.signatories.map(getName).join(", ")
    ];
  }
  const headers = ["Custodian", "Owner", "Account", "Signatories"]
  const ownerValues : any[] = accounts.filter(s => s.payload.owner === party).map(createRow);
  const custodianValues : any[] = accounts.filter(s => s.payload.custodian === party).map(createRow);

  return (
    <Grid container direction="row" spacing={4}>
      <Grid item xs={6}>
        <HorizontalTable title="Accounts Held" variant={"h3"} headers={headers} values={ownerValues}/>
      </Grid>
      <Grid item xs={6}>
        <HorizontalTable title="Accounts Provided" variant={"h3"} headers={headers} values={custodianValues}/>
      </Grid>
    </Grid>
  );
};
