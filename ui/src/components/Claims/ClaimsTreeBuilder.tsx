// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Dispatch, useCallback, useState } from "react";
import Tree from "react-d3-tree";
import { CustomNodeElementProps, Point, TreeNodeDatum } from "react-d3-tree/lib/types/common";
import { useTheme } from "@mui/material";
import { claimMenu, createAsset, createDate, createDecimal, createObservable, inequalityConstructors, inequalityTags, MenuEntry, observationConstructors, observationTags, updateNode } from "./util";
import useStyles from "./styles";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types/lib/Daml/Finance/Interface/Types/Common";
import "./styles.css";

export type ClaimsTreeBuilderProps = {
  node? : ClaimTreeNode
  setNode : Dispatch<ClaimTreeNode>
  assets : InstrumentKey[]
  height? : string
  readonly? : boolean
}

export type ClaimTreeNode = {
  id : string
  tag : string
  type : string
  children : ClaimTreeNode[]
  text? : string
  value? : any
}

export const ClaimsTreeBuilder : React.FC<ClaimsTreeBuilderProps> = ({ node, setNode, assets, height = "50vh", readonly = true } : ClaimsTreeBuilderProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const [ show, setShow ] = useState("");
  const [ sub, setSub ] = useState<string[]>([]);
  const [ value, setValue ] = useState("");
  const containerStyles = { height: height || "50vh" };

  const { translate, dimensions, containerRef } = useCenteredTree();

  if (!node) return <></>;
  const rootNode = { ...node };
  // NOTE: Copy needed as otherwise parent state update won't trigger rerender (likely due to reference being the same)
  const createNode = (d : any, newNode : any) => {
    updateNode(d.id, rootNode, newNode);
    setShow("");
    setSub([]);
    setValue("");
    setNode(rootNode);
  }

  const renderMenu = (d : any, entries : MenuEntry[], x : number, y : number) : JSX.Element => {
    const w = 100;
    return (
      <>
        {entries.map((e, i) => {
          if (e.children.length === 0 && !!e.constructor) return (
            <g key={i}>
              <rect className={classes.svgHover} x={-w / 2 + x * w} y={13 + y * 30 + i * 30} fill="#00000000" stroke="#666" width={w} height="30" onClick={() => createNode(d, e.constructor!())} />
              <text className={classes.svgNoMouse} x={x * w} y={34 + y * 30 + i * 30} fill={theme.palette.text.primary} textAnchor="middle" strokeWidth="0" onClick={() => createNode(d, e.constructor!())}>{e.label}</text>
            </g>)
          else return (
            <g key={i}>
              <rect className={classes.svgHover} x={-w / 2 + x * w} y={13 + y * 30 + i * 30} fill="#00000000" stroke="#666" width={w} height="30" onMouseOver={() => setSub(sub.length === x ? sub.concat([e.id]) : sub.slice(0, -x).concat([e.id]))} />
              <text className={classes.svgNoMouse} x={x * w} y={34 + y * 30 + i * 30} fill={theme.palette.text.primary} textAnchor="middle" strokeWidth="0">{e.label}</text>
              {sub.includes(e.id) && renderMenu(d, e.children, x + 1, y + i)}
            </g>)
        })}
      </>
    );
  };

  const renderMenuEntry = (d : any, constructor : () => any, tag : string, i : number) => {
    const w = 100;
    return (
      <g key={i}>
        <rect x={-w / 2} y={13 + i * 30} fill="#00000000" stroke="#ccc" width={w} height="30" onClick={() => createNode(d, constructor())} />
        <text x="0" y={34 + i * 30} fill={theme.palette.text.primary} textAnchor="middle" strokeWidth="0" onClick={() => createNode(d, constructor())}>{tag}</text>
      </g>
    );
  };

  const renderDecimalInput = (d : any, constructor : (v : string) => ClaimTreeNode) => {
    const onKeyDown = (e : any) => {
      if (e.key === "Enter") createNode(d, constructor(value));
    }
    return (
      <foreignObject x={-85} y="10" width="550" height="50">
        <div>
          <input type="number" autoFocus onKeyDown={onKeyDown} onChange={v => setValue(v.target.value)}></input>
        </div>
      </foreignObject>
    );
  };

  const renderDateInput = (d : any, constructor : (v : string) => ClaimTreeNode) => {
    const onKeyDown = (e : any) => {
      if (e.key === "Enter") createNode(d, constructor(value));
    }
    return (
      <foreignObject x={-65} y="10" width="350" height="50">
        <div>
          <input type="date" autoFocus onKeyDown={onKeyDown} onChange={v => setValue(v.target.value)}></input>
        </div>
      </foreignObject>
    );
  };

  const renderNode = ({ nodeDatum, toggleNode } : CustomNodeElementProps) => {
    const d = nodeDatum as TreeNodeDatum & ClaimTreeNode;
    if (d.type === "Claim") return renderClaimNode(d, toggleNode);
    else if (d.type === "Observation") return renderObservationNode(d, toggleNode);
    else if (d.type === "Inequality") return renderInequalityNode(d, toggleNode);
    else return renderValueNode(d, toggleNode);
  };

  const renderClaimNode = (d : TreeNodeDatum & ClaimTreeNode, toggleNode : () => void) : JSX.Element => {
    const placehoder = d.tag === "Claim";
    const text = (d.text || d.tag);
    const textWidth = Math.max(25, text.length * 12);
    const fill = placehoder ? theme.palette.background.paper : theme.palette.secondary.main;
    const stroke = theme.palette.secondary.light;
    const textColor = placehoder ? theme.palette.text.primary : "white";
    const onClick = readonly ? toggleNode : () => setShow(show === d.id ? "" : d.id || "");
    return (
      <g>
        <rect x={-textWidth / 2} y="-19" fill={fill} stroke={stroke} width={textWidth} height="30" rx="5" onClick={onClick} />
        <text x="0" y="2" fill={textColor} textAnchor="middle" strokeWidth="0" onClick={onClick}>{text}</text>
        {/* Paint circle outline for "children present", and circle full for "children expanded" */}
        {show === d.id && renderMenu(d, claimMenu, 0, 0)}
      </g>
    );
  };

  const renderObservationNode = (d : TreeNodeDatum & ClaimTreeNode, toggleNode : () => void) => {
    const placehoder = d.tag === "Observation";
    const text = (d.text || d.tag);
    const textWidth = Math.max(25, text.length * 12);
    const fill = placehoder ? theme.palette.background.paper : theme.palette.primary.main;
    const stroke = theme.palette.primary.light;
    const textColor = placehoder ? theme.palette.text.primary : "white";
    const onClick = readonly ? toggleNode : () => setShow(show === d.id ? "" : d.id);
    return (
      <g>
        <rect x={-textWidth / 2} y="-19" fill={fill} stroke={stroke} width={textWidth} height="30" rx="5" onClick={onClick} />
        <text x="0" y="2" fill={textColor} textAnchor="middle" strokeWidth="0" onClick={onClick}>{text}</text>
        {show === d.id && observationTags.map((tag, i) => renderMenuEntry(d, observationConstructors[i], tag, i))}
      </g>
    );
  };

  const renderInequalityNode = (d : TreeNodeDatum & ClaimTreeNode, toggleNode : () => void) => {
    const placehoder = d.tag === "Inequality";
    const text = (d.text || d.tag);
    const textWidth = Math.max(25, text.length * 12);
    const fill = placehoder ? theme.palette.background.paper : theme.palette.primary.main;
    const stroke = theme.palette.primary.light;
    const textColor = placehoder ? theme.palette.text.primary : "white";
    const onClick = readonly ? toggleNode : () => setShow(show === d.id ? "" : d.id || "");
    return (
      <g>
        <rect x={-textWidth / 2} y="-19" fill={fill} stroke={stroke} width={textWidth} height="30" rx="5" onClick={onClick} />
        <text x="0" y="2" fill={textColor} textAnchor="middle" strokeWidth="0" onClick={onClick}>{text}</text>
        {show === d.id && inequalityTags.map((tag, i) => renderMenuEntry(d, inequalityConstructors[i], tag, i))}
      </g>
    );
  };

  const renderValueNode = (d : TreeNodeDatum & ClaimTreeNode, toggleNode : () => void) => {
    const placehoder = d.tag === "Value";
    const text = (d.text || d.type);
    const textWidth = Math.max(25, text.length * 12);
    const fill = placehoder ? theme.palette.background.paper : theme.palette.grey[600];
    const stroke = theme.palette.grey[400];
    const textColor = placehoder ? theme.palette.text.primary : "white";
    const onClick = readonly ? toggleNode : () => setShow(show === d.id ? "" : d.id || "");
    return (
      <g>
        <rect x={-textWidth / 2} y="-19" fill={fill} stroke={stroke} width={textWidth} height="30" rx="5" onClick={onClick} />
        <text x="0" y="2" fill={textColor} textAnchor="middle" strokeWidth="0" onClick={onClick}>{text}</text>
        {show === d.id && d.type === "Observable" && assets.map((asset, i) => renderMenuEntry(d, () => createObservable(asset.id.unpack), asset.id.unpack, i))}
        {show === d.id && d.type === "Asset" && assets.map((asset, i) => renderMenuEntry(d, () => createAsset(asset), asset.id.unpack, i))}
        {show === d.id && d.type === "Decimal" && renderDecimalInput(d, createDecimal)}
        {show === d.id && d.type === "Date" && renderDateInput(d, createDate)}
      </g>
    );
  };

  return (
    <div style={containerStyles} ref={containerRef}>
      <Tree
        data={rootNode as any}
        translate={translate}
        scaleExtent={{ min: 0.01, max: 100 }}
        nodeSize={{ x: 100, y: 100 }}
        renderCustomNodeElement={renderNode}
        orientation="vertical"
        dimensions={{ width: dimensions.x, height: dimensions.y }}
        pathClassFunc={() => "edge"}
        // zoom={0.1}
      />
    </div>
  );
}

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }, defaultDimensions = { x: 100, y: 100 }) => {
  const [translate, setTranslate] = useState<Point>(defaultTranslate);
  const [dimensions, setDimensions] = useState<Point>(defaultDimensions);
  const containerRef = useCallback((containerElem : HTMLElement | null) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 25 });
      setDimensions({ x: width, y: height });
    }
  }, []);
  return { translate, dimensions, containerRef };
};

