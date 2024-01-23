// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Dispatch } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

type InstrumentProps = {
  label : string
  expanded : string
  setExpanded : Dispatch<string>
}

export const Instrument : React.FC<InstrumentProps> = ({ label, expanded, setExpanded, children }) => {
  const handleChange = () => {
    if (expanded === label) setExpanded("");
    else setExpanded(label);
  }

  return (
    <Accordion expanded={expanded === label} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography gutterBottom variant="h5" component="h2">{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container direction="row" spacing={2}>
          {children}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
