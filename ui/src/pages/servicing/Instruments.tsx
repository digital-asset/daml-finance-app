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
import { useLedger, useStreamQueries } from "@daml/react";
import useStyles from "../styles";
import { Spinner } from "../../components/Spinner/Spinner";
import { getName, version } from "../../util";
import { Button } from "@mui/material";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { DateClock, DateClockUpdateEvent } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Time/DateClock";
import { Observation } from "@daml.js/daml-finance-refdata/lib/Daml/Finance/RefData/Observation";
import { Effect } from "@daml.js/daml-finance-lifecycle/lib/Daml/Finance/Lifecycle/Effect";
import { Instrument } from "@daml.js/daml-finance-derivative/lib/Daml/Finance/Derivative/Instrument";

export const Instruments : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const ledger = useLedger();
  const { contracts: instruments, loading: l1 } = useStreamQueries(Instrument);
  const { contracts: services, loading: l2 } = useStreamQueries(Service);
  const { contracts: observations, loading: l3 } = useStreamQueries(Observation);
  const { contracts: effects, loading: l4 } = useStreamQueries(Effect);
  const { contracts: events, loading: l5 } = useStreamQueries(DateClockUpdateEvent);
  const { contracts: clocks, loading: l6 } = useStreamQueries(DateClock);

  if (l1 || l2 || l3 || l4 || l5 || l6) return (<Spinner />);

  const lifecycleAll = async () => {
    const lifecycle = async (lifecyclableCid : any) => {
      const observableCids = observations.map(c => c.contractId);
      const arg = {
        ruleName: "Time",
        eventCid: events[0].contractId,
        clockCid: clocks[0].contractId,
        observableCids,
        lifecyclableCid
      }
      await ledger.exercise(Service.Lifecycle, services[0].contractId, arg);
    }
    await Promise.all(instruments.map(i => lifecycle(i.contractId)));
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
                    <TableCell key={0} className={classes.tableCell}><b>Issuer</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Depository</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Instrument</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Version</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}>
                      <Button className={classes.choiceButton} size="large" variant="contained" color="primary" disabled={effects.length > 0} onClick={lifecycleAll}>Lifecycle All</Button>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instruments.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getName(c.payload.issuer)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.depository)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{c.payload.id.label}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{version(c.payload.id)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>
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
