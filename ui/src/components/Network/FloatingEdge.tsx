// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react";
import { useStore, getBezierPath, EdgeProps, EdgeText, getBezierEdgeCenter } from "react-flow-renderer";
import { getEdgeParams } from "./util";

export const FloatingEdge = ({
    source,
    target,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    markerEnd,
    markerStart,
    curvature,
  } : EdgeProps) => {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const p = getEdgeParams(sourceNode, targetNode);
  const [centerX, centerY] = source === target ? [sourceNode.position.x - 190, sourceNode.position.y + 10] : getBezierEdgeCenter(p);

  const d = getBezierPath(p);

  const text = label ? (
    <EdgeText
      x={centerX}
      y={centerY}
      label={label}
      labelStyle={labelStyle}
      labelShowBg={labelShowBg}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
    />
  ) : null;

  return (
    <>
      <path style={style} d={d} className="react-flow__edge-path" markerEnd={markerEnd} markerStart={markerStart} />
      {text}
    </>
  );
};

