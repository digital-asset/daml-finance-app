// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { dedup, keyEquals, shorten } from "../../util";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParties } from "../../context/PartiesContext";
import { SelectionTable } from "../../components/Table/SelectionTable";
import { Box, Button, Step, StepContent, StepLabel, Stepper } from "@mui/material";
import { EventAggregate, useEvents } from "../../context/EventContext";
import useStyles from "../styles";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { InstrumentAggregate, useInstruments } from "../../context/InstrumentContext";
import { HoldingAggregate, useHoldings } from "../../context/HoldingContext";
import { useServices } from "../../context/ServiceContext";
import { Service } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Lifecycle/Service";
import { NumericObservable } from "@daml.js/daml-finance-interface-lifecycle/lib/Daml/Finance/Interface/Lifecycle/Observable/NumericObservable";
import { useNavigate } from "react-router-dom";

export const Lifecycle : React.FC = () => {
  const [event, setEvent] = useState<EventAggregate>();
  const [instruments, setInstruments] = useState<InstrumentAggregate[]>([]);
  const [positions, setPositions] = useState<HoldingAggregate[]>([]);

  const navigate = useNavigate();
  const cls = useStyles();
  const party = useParty();
  const ledger = useLedger();
  const { getName, getNames } = useParties();
  const { loading: l1, events } = useEvents();
  const { loading: l2, latests } = useInstruments();
  const { loading: l3, holdings } = useHoldings();
  const { loading: l4, custody, lifecycle } = useServices();
  const { loading: l5, contracts: numericObservables } = useStreamQueries(NumericObservable);

  if (l1 || l2 || l3 || l4 || l5) return <Spinner />;

  const getLifecycleRule = (c : InstrumentAggregate) => {
    if (!event) throw new Error("No event selected");
    if (!!event.time) return !!c.generic ? lifecycle[0].payload.genericRuleCid : lifecycle[0].payload.dynamicRuleCid;
    if (!!event.distribution) return !!c.equity ? lifecycle[0].payload.equityDistributionRuleCid : lifecycle[0].payload.assetSwapDistributionRuleCid;
    if (!!event.replacement) return lifecycle[0].payload.replacementRuleCid;
    throw new Error("Unknown event type");
  };

  const lifecycleSelected = async () => {
    if (lifecycle.length === 0) throw new Error("No lifecycle service found");
    if (custody.length === 0) throw new Error("No custody service found");
    if (!event) throw new Error("No event selected");
    for (const i of instruments) {
      const instrumentPositions = positions.filter(p => keyEquals(p.payload.instrument, i.key));
      const custodiansAndOwners = dedup(instrumentPositions.map(p => p.payload.account.custodian + p.payload.account.owner));
      for (const p of custodiansAndOwners) {
        const filteredPositions = instrumentPositions.filter(h => h.payload.account.custodian + h.payload.account.owner === p);
        const custodyService = custody.find(c => c.payload.provider === filteredPositions[0].payload.account.custodian && c.payload.customer === filteredPositions[0].payload.account.owner);
        if (!custodyService) throw new Error("No custody service found for " + filteredPositions[0].payload.account.custodian + " and " + filteredPositions[0].payload.account.owner);
        const arg = {
          ctrl: party,
          eventCid: event.contractId,
          ruleCid: getLifecycleRule(i),
          observableCids: numericObservables.map(o => o.contractId),
          instrument: i.key,
          batchId: { unpack: "Batch-" + event.payload.id.unpack + "-" + i.payload.id.unpack },
          holdingCids: filteredPositions.map(h => h.contractId),
          claimRuleCid: custodyService.payload.claimRuleCid,
        }
        await ledger.exercise(Service.LifecycleAndClaim, lifecycle[0].contractId, arg);
      }
    }
    setEvent(undefined);
    setInstruments([]);
    setPositions([]);
    navigate("/app/settlement/batches");
  };

  const getEventType = (e : EventAggregate) => {
    return !!e.time ? "Time" : (!!e.distribution ? "Distribution" : "Replacement");
  };

  const createEventRow = (c : EventAggregate) : any[] => {
    return [
      getEventType(c),
      getNames(c.payload.providers),
      c.payload.id.unpack,
      c.payload.description,
      c.payload.eventTime,
      <Button color="primary" size="small" className={cls.choiceButton} variant="contained" onClick={() => setEvent(c)}>Select</Button>
    ];
  };
  const eventHeaders = ["Type", "Providers", "Id", "Description", "Event Time", "Action"];
  const eventValues : any[] = events.map(createEventRow);

  const displayInstrument = (c : InstrumentAggregate) => {
    if (!event) return false;
    if (!!event.time) return !!c.claim;
    if (!!event.distribution) {
      const isTargetEquity = keyEquals(event.distribution.payload.targetInstrument, c.key);
      const assetSwapWithUnderlying = !!c.assetSwap && c.assetSwap.payload.asset.underlyings.some(u => !!event.distribution && keyEquals(u.referenceAsset, event.distribution.payload.targetInstrument));
      return isTargetEquity || assetSwapWithUnderlying;
    };
    if (!!event.replacement) return !!c.equity;
    return false;
  };

  const filteredInstruments = latests.filter(displayInstrument);
  const createInstrumentRow = (c : InstrumentAggregate) : any[] => {
    return [
      getName(c.payload.depository),
      getName(c.payload.issuer),
      c.payload.id.unpack,
      c.payload.description,
      shorten(c.payload.version),
      c.payload.validAsOf,
    ];
  };
  const instrumentHeaders = ["Depository", "Issuer", "Id", "Description", "Version", "ValidAsOf"];
  const instrumentValues : any[] = filteredInstruments.map(createInstrumentRow);

  const filteredHoldings = holdings.filter(h => !!instruments.find(i => i.payload.id.unpack === h.payload.instrument.id.unpack && i.payload.version === h.payload.instrument.version));
  const createHoldingRow = (c : HoldingAggregate) : any[] => {
    return [
      getName(c.payload.account.custodian),
      getName(c.payload.account.owner),
      c.payload.account.id.unpack,
      c.payload.instrument.id.unpack + " (" + shorten(c.payload.instrument.version) + ")",
      c.payload.amount,
    ];
  };
  const holdingHeaders = ["Provider", "Owner", "Account", "Instrument", "Amount"];
  const holdingValues : any[] = filteredHoldings.map(createHoldingRow);

  const activeStep = !event ? 0 : (instruments.length === 0 ? 1 : (positions.length === 0 ? 2 : 3));

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step key={0}>
          <StepLabel>{!event ? "Select event" : getEventType(event) + " Event [" + event.payload.description + "]"}</StepLabel>
          <StepContent>
            <HorizontalTable headers={eventHeaders} values={eventValues}/>
          </StepContent>
        </Step>
        <Step key={1}>
          <StepLabel>{instruments.length === 0 ? "Select instruments" : instruments.length + " instrument(s) selected"}</StepLabel>
          <StepContent>
            <SelectionTable headers={instrumentHeaders} values={instrumentValues} action="Select" onExecute={selected => Promise.resolve(setInstruments(selected))} callbackValues={filteredInstruments} />
          </StepContent>
        </Step>
        <Step key={2}>
          <StepLabel>{positions.length === 0 ? "Select positions" : positions.length + " position(s) selected"}</StepLabel>
          <StepContent>
            <SelectionTable headers={holdingHeaders} values={holdingValues} action="Select" onExecute={selected => Promise.resolve(setPositions(selected))} callbackValues={filteredHoldings} />
          </StepContent>
        </Step>
      </Stepper>
      {positions.length > 0 && (
        <Button color="primary" size="large" variant="contained" onClick={lifecycleSelected} sx={{ mt: 5 }}>
          Lifecycle
        </Button>
      )}
    </Box>
  );
};
