// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { Grid } from "@mui/material";
import { Instrument as InstrumentCard } from "../../components/Card/Instrument";
import { Instrument as InstrumentPanel } from "../../components/Panel/Instrument";

export const New : React.FC = () => {

  const [ expanded, setExpanded ] = useState("");

  return (
    <Grid container direction="column">
      <Grid item xs={12}>
        {/* <InstrumentPanel label="Equities" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Binary Option" path="binaryoption" />
          <InstrumentCard label="Total Return Swap" path="totalreturnswap" />
          <InstrumentCard label="Turbo Warrant" path="turbowarrant" />
        </InstrumentPanel> */}
        <InstrumentPanel label="Fixed Income" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Fixed Rate Bond" path="fixedratebond" />
          {/* <InstrumentCard label="Floating Rate Bond" path="floatingratebond" /> */}
        </InstrumentPanel>
        {/* <InstrumentPanel label="Credit" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Credit Default Swap" path="creditdefaultswap" />
        </InstrumentPanel>
        <InstrumentPanel label="Hybrid" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Convertible Note" path="convertiblenote" />
        </InstrumentPanel> */}
        <InstrumentPanel label="Other" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Base Instrument" path="base" />
          <InstrumentCard label="Custom Instrument" path="custom" />
        </InstrumentPanel>
      </Grid>
    </Grid>
  );
}
