// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from "react";
import Tree from 'react-d3-tree';
import { CustomNodeElementProps, Point } from "react-d3-tree/lib/types/common";
import { C, claimToNode } from "./util";
import { useTheme } from "@mui/material";

type ClaimsTreeProps = {
  claims : C
  height? : string
}

export const ClaimsTree : React.FC<ClaimsTreeProps> = ({ claims, height = "50vh" } : ClaimsTreeProps) => {

  const theme = useTheme();
  const containerStyles = { height };

  const data = claimToNode(claims);

  const renderNode = ({ nodeDatum, toggleNode } : CustomNodeElementProps) => {
    const d : any = nodeDatum;
    const text = d.text || d.tag
    const textWidth = Math.max(25, text.length * 12);
    const fill = d.type === "Claim" ? theme.palette.primary.main : theme.palette.secondary.main;
    return (
      <g>
        <rect x={-textWidth / 2} y="-19" fill={fill} stroke="#4d4d4d" width={textWidth} height="30" rx="5" onClick={toggleNode} />
        <text x="0" y="2" fill="white" text-anchor="middle" strokeWidth="0" onClick={toggleNode}>{text}</text>
      </g>
    );
  };

  const { translate, containerRef } = useCenteredTree();

  return (
    <div style={containerStyles} ref={containerRef}>
      <Tree
        data={data as any}
        translate={translate}
        scaleExtent={{ min: 0.01, max: 100 }}
        nodeSize={{ x: 150, y: 100 }}
        renderCustomNodeElement={renderNode}
        enableLegacyTransitions={true}
        orientation="vertical"
        // zoom={0.1}
      />
    </div>
  );
}

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState<Point>(defaultTranslate);
  const containerRef = useCallback((containerElem : HTMLElement | null) => {
    if (containerElem !== null) {
      const { width } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 25 });
    }
  }, []);
  return { translate, containerRef };
};

// const renderNodeWithCustomEvents = ({ nodeDatum, toggleNode } : CustomNodeElementProps) => (
//   <g>
//     <circle r="15" onClick={() => handleNodeClick(nodeDatum)} />
//     <text fill="black" strokeWidth="1" x="20" onClick={toggleNode}>
//       {nodeDatum.name} (click me to toggle 👋)
//     </text>
//     {nodeDatum.attributes?.department && (
//       <text fill="black" x="20" dy="20" strokeWidth="1">
//         Department: {nodeDatum.attributes?.department}
//       </text>
//     )}
//   </g>
// );

// const nodeSize = { x: 200, y: 200 };
// const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };

// const renderForeignObjectNode = ({ nodeDatum, toggleNode } : CustomNodeElementProps) => (
//   <g>
//     <circle r={15}></circle>
//     {/* `foreignObject` requires width & height to be explicitly set. */}
//     <foreignObject {...foreignObjectProps}>
//       <div style={{ border: "1px solid black", backgroundColor: "#dedede" }}>
//         <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
//         {nodeDatum.children && (
//           <button style={{ width: "100%" }} onClick={toggleNode}>
//             {nodeDatum.__rd3t.collapsed ? "Expand" : "Collapse"}
//           </button>
//         )}
//       </div>
//     </foreignObject>
//   </g>
// );

