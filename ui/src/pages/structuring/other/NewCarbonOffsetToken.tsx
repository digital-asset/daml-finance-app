// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Paper, TextField, Button } from "@mui/material";
import { DateInput } from "../../../components/Form/DateInput";
import { TextInput } from "../../../components/Form/TextInput";
import { ToggleInput } from "../../../components/Form/ToggleInput";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";
import { CenteredForm } from "../../../components/CenteredForm/CenteredForm";
import classnames from "classnames";
import { useLedger } from "@daml/react";
import useStyles from "../../styles";
import { parseDate,singleton } from "../../../util";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Message } from "../../../components/Message/Message";
import { emptyMap } from "@daml/types";
import { useParties } from "../../../context/PartiesContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Structuring } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Service";
import { Service as StructuringAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Structuring/Auto/Service";


export const NewCarbonOffsetToken : React.FC = () => {
  const cls = useStyles();
  const classes = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ country, setCountry ] = useState("");
  const [ projectType, setProjectType ] = useState("");
  const [ expiryDate, setExpiryDate ] = useState<Date | null>(null);
  const [ sustainableDevelopmentGoals, setSustainableDevelopmentGoals ] = useState("");

  const canRequest = !!id && !!description;

  const ledger = useLedger();
  const { getParty } = useParties();
  const { loading: l1, structuring, structuringAuto } = useServices();

  if (l1) return <Spinner />;
  if (structuring.length === 0) return <Message text="No structuring service found" />

  const createCarbonOffsetToken = async () => {
    const arg = {
      id,
      description,
      observers: emptyMap<string, any>().set("Public", singleton(getParty("Public"))),
      validAsOf: new Date().toISOString(),
      country,
      projectType,
      expiryDate: parseDate(expiryDate),
      sustainableDevelopmentGoals

    };
    if (structuringAuto.length > 0) await ledger.exercise(StructuringAuto.RequestAndCreateCarbonOffsetToken, structuringAuto[0].contractId, arg);
    else await ledger.exercise(Structuring.RequestCreateToken, structuring[0].contractId, arg);
    navigate("/app/structuring/instruments");
  };
  return (
    <CenteredForm title= "New Carbon Offset Token">
      <TextInput    label="Id"               value={id}                     setValue={setId} />
      <TextInput    label="Description"      value={description}            setValue={setDescription} />
      <TextInput    label="country"          value={country}                setValue={setCountry} />
      <TextInput    label="projectType"      value={projectType}            setValue={setProjectType} />
      <DateInput    label="Expiry Date"      value={expiryDate}             setValue={setExpiryDate} />
      <TextInput    label="sustainableDevelopmentGoals"      value={sustainableDevelopmentGoals}            setValue={setSustainableDevelopmentGoals} />
      <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createCarbonOffsetToken}>Create Instrument</Button>
    </CenteredForm>
  );

  // return (
  //   <Grid container direction="column" spacing={2}>
  //     <Grid item xs={12}>
  //       <Typography variant="h3" className={classes.heading}>New Base Instrument</Typography>
  //     </Grid>
  //     <Grid item xs={12}>
  //       <Grid container spacing={4}>
  //         <Grid item xs={3}>
  //           <Grid container direction="column" spacing={2}>
  //             <Grid item xs={12}>
  //               <Paper className={classnames(classes.fullWidth, classes.paper)}>
  //                 <Typography variant="h5" className={classes.heading}>Parameters</Typography>
  //                 <TextField className={classes.inputField} fullWidth label="Id" type="text" value={id} onChange={e => setId(e.target.value as string)} />
  //                 <TextField className={classes.inputField} fullWidth label="Description" type="text" value={description} onChange={e => setDescription(e.target.value as string)} />
  //                 <TextField className={classes.inputField} fullWidth label="country" type="text" value={country} onChange={e => setCountry(e.target.value as string)} />
  //                 <TextField className={classes.inputField} fullWidth label="projectType" type="text" value={projectType} onChange={e => setProjectType(e.target.value as string)} />
  //                 <DateInput    label="Expiry Date"           value={expiryDate}          setValue={setExpiryDate} />
  //                 <TextField className={classes.inputField} fullWidth label="sustainableDevelopmentGoals" type="text" value={sustainableDevelopmentGoals} onChange={e => setSustainableDevelopmentGoals(e.target.value as string)} /> 
  //                 <Button className={classnames(classes.fullWidth, classes.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={createCarbonOffsetToken}>Create Instrument</Button>
  //               </Paper>
  //             </Grid>
  //           </Grid>
  //         </Grid>
  //       </Grid>
  //     </Grid>
  //   </Grid>
  // );

};
