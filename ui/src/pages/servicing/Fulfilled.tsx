// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Spinner } from "../../components/Spinner/Spinner";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { useParties } from "../../context/PartiesContext";
import { CreateEvent } from "@daml/ledger";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { fmt, singleton } from "../../util";
import { UsageCounter } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Model";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Oracle/Service";
import { useServices } from "../../context/ServiceContext";
import { Button } from "@mui/material";
import useStyles from "../styles";
import { useNavigate } from "react-router-dom";

export const Fulfilled : React.FC = () => {
  const ledger = useLedger();
  const party = useParty();
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const [ rows, setRows ] = useState<any[]>([]);

  const { loading: l1, contracts: usageCounters } = useStreamQueries(UsageCounter);
  const { loading: l2, oracle } = useServices();

  const revoke = async (usage : CreateEvent<UsageCounter>) => {
    const arg = {
      reason: "UI"
    };
    await ledger.exercise(UsageCounter.Revoke, usage.contractId, arg);
  };

  const reportUsage = async (usage : CreateEvent<UsageCounter>) => {
    const arg = {
        increase: "1"
    };
    await ledger.exercise(UsageCounter.Increment, usage.contractId, arg);
  };

  useEffect(() => {
    if (l1) return;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const createRow = async (c : CreateEvent<UsageCounter>) : Promise<any[]> => {
      const [obs, ] = await ledger.exercise(NumericObservable.Observe, c.payload.observationCid, { actors: singleton(party), t: c.payload.fulfilled });
      return [
        getName(c.payload.provider),
        getName(c.payload.customer),
        c.payload.instrument.id.unpack,
        c.payload.oracleId,
        c.payload.requested, 
        c.payload.fulfilled,
        c.payload.count,
        fmt(obs,4),
        party === c.payload.provider 
          ? <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => revoke(c)}>Revoke</Button> 
          : party === c.payload.customer 
            ? <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => reportUsage(c)}>Report</Button>
            : <></>
      ];
    }
    const createRows = async () => {
      const r = [];
      for (var i = 0; i < usageCounters.length; i++) {
        const row = await createRow(usageCounters[i]);
        r.push(row);
      }
      r.sort();
      setRows(r);
    }
    createRows();
  }, [l1, usageCounters, getName, ledger, party]);

  if (l1) return <Spinner />;
  console.log(usageCounters);

  const headers = ["Provider", "Customer", "Instrument", "Mapped Id", "Requested", "Fulfilled", "Usage", "Value", "Action"]
  return (
    <HorizontalTable title="Price Sheet" variant={"h3"} headers={headers} values={rows} />
  );
};
