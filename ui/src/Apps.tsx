// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid, Theme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";
import origination from "./images/origination.jpg";
import issuance from "./images/issuance.jpg";
import custody from "./images/custody.jpg";
import distribution from "./images/distribution.png";
import lifecycling from "./images/lifecycling.jpg";
import simulation from "./images/simulation.jpg";
import listing from "./images/listing.png";
import trading from "./images/trading.jpg";
// import defi from "./images/defi.jpg";
// import network from "./images/network.jpg";
import { Header } from "./components/Header/Header";
import { App } from "./components/Card/App";

export const Apps : React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <Header app="Portal" />
      <Grid container direction="column" className={classes.bg}>
        <Grid item xs={12}>
          <Grid container direction="row" spacing={4}>
            <App label="Structuring "         description="Structure and design new assets"         image={origination}   path="/origination/instruments" />
            <App label="Issuance"             description="Issue new assets"                        image={issuance}      path="/issuance/issuances" />
            <App label="Custody"              description="Manage assets in custody"                image={custody}       path="/custody/assets" />
            <App label="Distribution"         description="Distribute assets in the primary market" image={distribution}  path="/distribution/auctions" />
            <App label="Servicing"            description="Service and lifecycle your assets"       image={lifecycling}   path="/servicing/instruments" />
            <App label="Simulation"           description="Run market scenarios on your assets"     image={simulation}    path="/simulation/scenario" />
            <App label="Listing"              description="List your assets on trading venues"      image={listing}       path="/listing/listings" />
            <App label="Trading"              description="Trade assets in the secondary market"    image={trading}       path="/trading/markets" />
            {/* <App label="DeFi"                 description="Access decentralized finance protocols"  image={defi}          path="/defi/trading" /> */}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

const useStyles = makeStyles((theme : Theme) => createStyles({
  bg: {
    backgroundColor: theme.palette.background.default,
    marginTop: 85,
    paddingLeft: 20,
    paddingRight: 20,
  },
}));
