// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Scenario, scenarios } from "../config";

export type Control = {
  selected : Scenario,
  select : (name : string) => void,
}

export const useScenario = () : Control => {
  const [scenario, setScenario] = useState(scenarios[0]);
  const selectScenario = (name : string) => {
    console.log(name);
    const s = scenarios.find(s => s.name === name);
    if (!s) throw new Error("Couldn't find scenario " + name);
    setScenario(s);
  }
  return { selected: scenario, select: selectScenario };
};
