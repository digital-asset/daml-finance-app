// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { Button } from "@mui/material";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { useParties } from "../../context/PartiesContext";
import { useServices } from "../../context/ServiceContext";
import { useInstruments } from "../../context/InstrumentContext";
import { Clock } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Clock";
import { Event } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Event";
import { Observable } from "@daml.js/daml-finance-interface-data/lib/Daml/Finance/Interface/Data/Observable";
import { Lifecycle } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Rule/Lifecycle";
import { CreateEvent } from "@daml/ledger";
import { shorten } from "../../util";

export const Instruments : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { getName } = useParties();
  const party = useParty();
  const ledger = useLedger();
  const svc = useServices();
  const inst = useInstruments();

  const { contracts: observables, loading: l1 } = useStreamQueries(Observable);
  const { contracts: events, loading: l2 } = useStreamQueries(Event);
  const { contracts: clocks, loading: l3 } = useStreamQueries(Clock);

  if (l1 || l2 || l3 || svc.loading || inst.loading) return <Spinner />;

  const myInstruments = inst.latests.filter(a => (!!a.lifecycle && a.lifecycle.payload.lifecycler === party) || (!!a.equity && a.payload.issuer === party));

  const lifecycleAll = async () => {
    const lifecycle = async (c : CreateEvent<Lifecycle>) => {
      const arg = {
        ruleName: "Time",
        // TODO: Assumes the only event we have is a DateClockUpdatedEvent
        eventCid: events[0].contractId,
        clockCid: clocks[0].contractId,
        observableCids: observables.map(o => o.contractId),
        lifecyclableCid: c.contractId
      }
      await ledger.exercise(Service.Lifecycle, svc.lifecycle[0].contractId, arg);
    }
    await Promise.all(myInstruments.map(c => lifecycle(c.lifecycle!)));
    navigate("/servicing/effects");
  };

  return (
    <>
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}>
                <Typography variant="h2">Instruments</Typography>
              </Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Depository</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Id</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Description</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>ValidAsOf</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}>
                      <Button className={classes.choiceButton} size="large" variant="contained" color="primary" disabled={myInstruments.length === 0} onClick={lifecycleAll}>Lifecycle All</Button>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myInstruments.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.depository)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.issuer)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id.unpack}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{c.payload.description}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{shorten(c.payload.version)}</TableCell>
                      <TableCell key={5} className={classes.tableCell}>{c.payload.validAsOf}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate(c.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
