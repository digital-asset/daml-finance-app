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
        <InstrumentPanel label="Bond" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Fixed Rate Bond" path="bond/fixedrate" />
          <InstrumentCard label="Floating Rate Bond" path="bond/floatingrate" />
          <InstrumentCard label="Inflation Linked Bond" path="bond/inflationlinked" />
          <InstrumentCard label="Zero Coupon Bond" path="bond/zerocoupon" />
        </InstrumentPanel>
        <InstrumentPanel label="Other" expanded={expanded} setExpanded={setExpanded}>
          <InstrumentCard label="Base Instrument" path="other/base" />
          <InstrumentCard label="Generic Instrument" path="other/generic" />
        </InstrumentPanel>
      </Grid>
    </Grid>
  );
}
