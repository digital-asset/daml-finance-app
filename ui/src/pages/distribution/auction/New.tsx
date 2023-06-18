// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Typography, Grid, Paper, Button } from "@mui/material";
import useStyles from "../../styles";
import { Spinner } from "../../../components/Spinner/Spinner";
import { Reference } from "@daml.js/daml-finance-interface-account/lib/Daml/Finance/Interface/Account/Account";
import { createSet } from "../../../util";
import { useParties } from "../../../context/PartiesContext";
import { useInstruments } from "../../../context/InstrumentContext";
import { useServices } from "../../../context/ServiceContext";
import { Service as Auction } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Service";
import { Service as AuctionAuto } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Distribution/Auction/Auto/Service";
import { Message } from "../../../components/Message/Message";
import { useHoldings } from "../../../context/HoldingContext";
import { Aggregate } from "../../../components/Instrument/Aggregate";
import { TextInput } from "../../../components/Form/TextInput";
import { SelectInput, toValues } from "../../../components/Form/SelectInput";

export const New : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();

  const [ id, setId ] = useState("");
  const [ instrumentLabel, setInstrumentLabel ] = useState("");
  const [ amount, setAmount ] = useState("");
  const [ currencyLabel, setCurrencyLabel ] = useState("");
  const [ floor, setFloor ] = useState("");

  const ledger = useLedger();
  const party = useParty();
  const { getParty } = useParties();
  const { loading: l1, auction, auctionAuto } = useServices();
  const { loading: l2, latests, tokens } = useInstruments();
  const { loading: l3, holdings, getFungible } = useHoldings();
  const { loading: l4, contracts: accounts } = useStreamQueries(Reference);

  if (l1 || l2 || l3 || l4) return <Spinner />;

  const myServices = auction.filter(s => s.payload.customer === party);
  const myAutoServices = auctionAuto.filter(s => s.payload.customer === party);
  const instrument = latests.find(c => c.payload.id.unpack === instrumentLabel);
  const currency = tokens.find(c => c.payload.id.unpack === currencyLabel);
  const myHoldings = holdings.filter(c => c.payload.account.owner === party);
  const myInstrumentValues = myHoldings.map(c => c.payload.instrument.id.unpack).filter((v, i, a) => a.indexOf(v) === i).map(c => ({ value: c, display: c }));
  const canRequest = !!instrumentLabel && !!instrument && !!currencyLabel && !!currency && !!id && !!amount && !!floor;

  if (myServices.length === 0) return <Message text={"No auction service found for customer: " + party} />;

  const requestCreateAuction = async () => {
    if (!instrument || !currency) return;
    const collateralCid = await getFungible(party, amount, instrument.key);
    const receivableAccount = accounts.find(c => c.payload.accountView.custodian === currency.payload.depository && c.payload.accountView.owner === party)?.key;
    if (!receivableAccount) return;
    const arg = {
      id,
      quantity: { amount, unit: instrument.key },
      currency: currency.key,
      floor: floor,
      collateralCid,
      receivableAccount,
      observers: createSet([getParty("Public")])
    };
    if (myAutoServices.length > 0) {
      await ledger.exercise(AuctionAuto.RequestAndCreateAuction, myAutoServices[0].contractId, arg);
      navigate("/app/distribution/auctions");
    } else {
      await ledger.exercise(Auction.RequestCreateAuction, myServices[0].contractId, arg);
      navigate("/app/distribution/requests");
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" className={classnames(cls.defaultHeading, cls.centered)}>New Auction</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={4}>
          <Grid item xs={4}>
            <Paper className={classnames(cls.fullWidth, cls.paper)}>
              <TextInput    label="Id"                          value={id}                    setValue={setId} />
              <SelectInput  label="Asset"                       value={instrumentLabel}       setValue={setInstrumentLabel}       values={myInstrumentValues} />
              <TextInput    label="Notional"                    value={amount}                setValue={setAmount} />
              <SelectInput  label="Currency"                    value={currencyLabel}         setValue={setCurrencyLabel}         values={toValues(tokens)} />
              <TextInput    label="Floor Price"                 value={floor}                 setValue={setFloor} />
              <Button className={classnames(cls.fullWidth, cls.buttonMargin)} size="large" variant="contained" color="primary" disabled={!canRequest} onClick={requestCreateAuction}>Create Auction</Button>
            </Paper>
          </Grid>
          <Grid item xs={8}>
            {!!instrument && <Aggregate instrument={instrument} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
