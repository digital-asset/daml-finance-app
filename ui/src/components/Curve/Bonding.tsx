// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from "react";
import { render } from "./renderCurve";

type BondingProps = {
  xAsset : string
  yAsset : string
  x : number
  y : number
  xNew : number
  yNew : number
}

export const Bonding : React.FC<BondingProps> = ({ xAsset, yAsset, x, y, xNew, yNew } : BondingProps) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    el.current.innerHTML = "";
    render(el.current, xAsset, yAsset, x, y, xNew, yNew, (a : number) => x * y / a, 400);
  }, [el, xAsset, yAsset, x, y, xNew, yNew]);

  return (
    <div ref={el} style={{ height: "100%" }}/>
  );
};
