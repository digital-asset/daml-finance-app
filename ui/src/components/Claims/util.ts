// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Claim, Inequality } from "@daml.js/contingent-claims-core/lib/ContingentClaims/Core/Internal/Claim";
import { Observation } from "@daml.js/contingent-claims-core/lib/ContingentClaims/Core/Observation";
import { Decimal, Time } from "@daml/types";
import { ClaimTreeNode } from "./ClaimsTreeBuilder";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";

export type MenuEntry = {
  id : string
  label : string
  children : MenuEntry[]
  constructor? : () => any
}

type O = Observation<Time, Decimal, string>
type I = Inequality<Time, Decimal, string>
export type C = Claim<Time, Decimal, InstrumentKey, string>

export const lte      = (lhs : O, rhs : O) : I => ({ tag: "Lte", value: { _1: lhs, _2: rhs } });
export const at       = (date : string) : I => ({ tag: "TimeGte", value: date });
export const observe  = (id : string) : O => ({ tag: "Observe", value: { key: id } });
export const konst    = (value : string) : O => ({ tag: "Const", value: { value } });
export const add      = (lhs : O, rhs : O) : O => ({ tag: "Add", value: { _1: lhs, _2: rhs } });
export const neg      = (obs : O) : O => ({ tag: "Neg", value: obs });
export const sub      = (lhs : O, rhs : O) : O => add(lhs, neg(rhs));
export const mul      = (lhs : O, rhs : O) : O => ({ tag: "Mul", value: { _1: lhs, _2: rhs } });
export const div      = (lhs : O, rhs : O) : O => ({ tag: "Div", value: { _1: lhs, _2: rhs } });

export const zero : C =  ({ tag: "Zero", value: {} });
export const one      = (id : InstrumentKey) : C => ({ tag: "One", value: id });
export const give     = (claim : C) : C => ({ tag: "Give", value: claim });
export const and      = (claims : C[]) : C => ({ tag: "And", value: { a1: claims[0], a2: claims[1], as: claims.slice(2) } });
export const or       = (electables : { _1 : string, _2 : C }[]) : C => ({ tag: "Or", value: { or1: electables[0], or2: electables[1], ors: electables.slice(2) } });
export const scale    = (k : O, claim : C) : C => ({ tag: "Scale", value: { k, claim } });
export const cond     = (predicate : I, success : C, failure : C) : C => ({ tag: "Cond", value: { predicate, success, failure } });
export const when     = (predicate : I, claim : C) : C => ({ tag: "When", value: { predicate, claim } });
export const anytime  = (predicate : I, electable : { _1 : string, _2 : C }) : C => ({ tag: "Anytime", value: { predicate, electable } });
export const until    = (predicate : I, claim : C) : C => ({ tag: "Until", value: { predicate, claim } });

export const findObservables = (obs : O) : string[] => {
  switch (obs.tag) {
    case "Const":
      return [];
    case "Observe":
      return [obs.value.key];
    case "Add":
    case "Mul":
    case "Div":
      return findObservables(obs.value._1).concat(findObservables(obs.value._2));
    case "Neg":
      return findObservables(obs.value);
    default:
      return [];
  }
};

export const claimToNode = (claim : C) : ClaimTreeNode => {
  switch (claim.tag) {
    case "Zero":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [] };
    case "One":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ createAsset(claim.value) ] };
    case "Give":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ claimToNode(claim.value) ] };
    case "And":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ claimToNode(claim.value.a1), claimToNode(claim.value.a2) ].concat(claim.value.as.map(c => claimToNode(c))) };
    case "Or":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ claimToNode(claim.value.or1._2), claimToNode(claim.value.or2._2) ].concat(claim.value.ors.map(c => claimToNode(c._2))) };
    case "Cond":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ inequalityToNode(claim.value.predicate), claimToNode(claim.value.success), claimToNode(claim.value.failure) ] };
    case "Scale":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ observationToNode(claim.value.k), claimToNode(claim.value.claim) ] };
    case "When":
    case "Until":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ inequalityToNode(claim.value.predicate), claimToNode(claim.value.claim) ] };
    case "Anytime":
      return { id: uuidv4(), tag: claim.tag, type: "Claim", children: [ inequalityToNode(claim.value.predicate), claimToNode(claim.value.electable._2) ] };
  }
};

export const observationToNode = (obs : O) : ClaimTreeNode => {
  switch (obs.tag) {
    case "Const":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ createDecimal(obs.value.value) ] };
    case "Observe":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ createObservable(obs.value.key) ] };
    case "ObserveAt":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ createObservable(obs.value.key), createDate(obs.value.t) ] };
    case "Add":
      if (obs.value._2.tag === "Neg")
        return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ observationToNode(obs.value._1), observationToNode(obs.value._2).children[0] ], text: "-" };
      else
        return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ observationToNode(obs.value._1), observationToNode(obs.value._2) ], text: "+" };
    case "Neg":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ observationToNode(obs.value) ], text: "-" };
    case "Mul":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ observationToNode(obs.value._1), observationToNode(obs.value._2) ], text: "*"  };
    case "Div":
      return { id: uuidv4(), tag: obs.tag, type: "Observation", children: [ observationToNode(obs.value._1), observationToNode(obs.value._2) ], text: "/" };
  }
};

export const inequalityToNode = (ineq : I) : ClaimTreeNode => {
  switch (ineq.tag) {
    case "TimeGte":
      return { id: uuidv4(), tag: ineq.tag, type: "Inequality", children: [ createDate(ineq.value) ], text: "Date >=" };
    case "TimeLte":
      return { id: uuidv4(), tag: ineq.tag, type: "Inequality", children: [ createDate(ineq.value) ], text: "Date <=" };
    case "Lte":
      return { id: uuidv4(), tag: ineq.tag, type: "Inequality", children: [ observationToNode(ineq.value._1), observationToNode(ineq.value._2) ], text: "<=" };
  }
};

export const nodeToClaim = (data : ClaimTreeNode) : C => {
  switch (data.tag) {
    case "Zero":
      return { tag: data.tag, value: {} };
    case "One":
      return { tag: data.tag, value: data.children[0].value! };
    case "Give":
      return { tag: data.tag, value: nodeToClaim(data.children[0]) };
    case "And":
      return { tag: data.tag, value: { a1: nodeToClaim(data.children[0]), a2: nodeToClaim(data.children[1]), as: data.children.slice(2).map(c => nodeToClaim(c)) } };
    case "Or":
      return { tag: data.tag, value: { or1: { _1: "or1", _2: nodeToClaim(data.children[0]) }, or2: { _1: "or2", _2: nodeToClaim(data.children[1]) }, ors: data.children.slice(2).map((c, i) => ({ _1: "or" + i, _2: nodeToClaim(c) })) } };
    case "Cond":
      return { tag: data.tag, value: { predicate: nodeToInequality(data.children[0]), success: nodeToClaim(data.children[1]), failure: nodeToClaim(data.children[2]) } };
    case "Scale":
      return { tag: data.tag, value: { k: nodeToObservation(data.children[0]), claim: nodeToClaim(data.children[1])} };
    case "When":
    case "Until":
      return { tag: data.tag, value: { predicate: nodeToInequality(data.children[0]), claim: nodeToClaim(data.children[1]) } };
    case "Anytime":
      return { tag: data.tag, value: { predicate: nodeToInequality(data.children[0]), electable: { _1: "anytime", _2: nodeToClaim(data.children[1]) } } };
    default: throw new Error("Unknown claim tag");
  }
};

export const nodeToObservation = (data : ClaimTreeNode) : Observation<Time, Decimal, string> => {
  switch (data.tag) {
    case "Const":
      return { tag: data.tag, value: { value: nodeToValue(data.children[0]) } };
    case "Observe":
      const key = nodeToValue(data.children[0]);
      return { tag: data.tag, value: { key } };
    case "ObserveAt":
      const obs = nodeToValue(data.children[0]);
      const t = nodeToValue(data.children[0]);
      return { tag: data.tag, value: { key: obs, t } };
    case "Add":
    case "Mul":
    case "Div":
      return { tag: data.tag, value: { _1: nodeToObservation(data.children[0]), _2: nodeToObservation(data.children[1]) } };
    case "Sub":
      return { tag: "Add", value: { _1: nodeToObservation(data.children[0]), _2: { tag: "Neg", value: nodeToObservation(data.children[1]) } } };
    case "Neg":
      return { tag: data.tag, value: nodeToObservation(data.children[0]) };
    default: throw new Error("Unknown observation tag");
  }
};

export const nodeToInequality = (data : ClaimTreeNode) : I => {
  switch (data.tag) {
    case "TimeGte":
      return { tag: data.tag, value: new Date(nodeToValue(data.children[0])).toISOString() };
    case "Lte":
      return { tag: data.tag, value: { _1: nodeToObservation(data.children[0]), _2: nodeToObservation(data.children[1]) } };
    default: throw new Error("Unknown inequality tag");
  }
};

export const nodeToValue = (data : ClaimTreeNode) : string => {
  return data.value!;
};

export const updateNode = (id : number, node : any, datum : any) => {
  if (node.id === id) {
    node.tag = datum.tag;
    node.type = datum.type;
    node.value = datum.value;
    node.text = datum.text;
    node.children = datum.children;
  } else if (!!node.children) {
    for (let i = 0; i < node.children.length; i++) {
      updateNode(id, node.children[i], datum);
    }
  }
}

// ---------------
const createClaim   = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Claim",    type: "Claim", children: [] });
const createZero    = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Zero",     type: "Claim", children: [] });
const createOne     = () : ClaimTreeNode => ({ id: uuidv4(), tag: "One",      type: "Claim", children: [ createValue("Asset") ] });
const createGive    = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Give",     type: "Claim", children: [ createClaim() ] });
const createAnd     = () : ClaimTreeNode => ({ id: uuidv4(), tag: "And",      type: "Claim", children: [ createClaim(), createClaim() ] });
const createOr      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Or",       type: "Claim", children: [ createClaim(), createClaim() ] });
const createCond    = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Cond",     type: "Claim", children: [ createInequality(), createClaim(), createClaim() ] });
const createScale   = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Scale",    type: "Claim", children: [ createObservation(), createClaim() ] });
const createWhen    = () : ClaimTreeNode => ({ id: uuidv4(), tag: "When",     type: "Claim", children: [ createInequality(), createClaim() ] });
const createAnytime = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Anytime",  type: "Claim", children: [ createInequality(), createClaim() ] });
const createUntil   = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Until",    type: "Claim", children: [ createInequality(), createClaim() ] });

const createEuropean      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "When",     type: "Claim", children: [ createTimeGte(), createClaim() ] });
const createAmerican      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Anytime",  type: "Claim", children: [ createTimeGte(), { id: uuidv4(), tag: "Until", type: "Claim", children: [ createTimeGte(), createClaim() ] } ] });
const createPerpetual     = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Anytime",  type: "Claim", children: [ createTimeGte(), createClaim() ] });
const createAutoCall      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Cond",     type: "Claim", children: [ createCall(), createClaim(), createZero() ] });
const createAutoPut       = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Cond",     type: "Claim", children: [ createPut(), createClaim(), createZero() ] });
const createElection      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Or",       type: "Claim", children: [ createClaim(), createZero() ] })
const createPhysical      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "And",      type: "Claim", children: [ createGive(), createClaim() ] })
const createCash          = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Scale",    type: "Claim", children: [ createSub(), createOne() ] })
const createCashCall      = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Scale",    type: "Claim", children: [ { id: uuidv4(), tag: "Sub", type: "Inequality", children: [ createObserve(), createConst() ] }, createOne() ] })
const createCashPut       = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Scale",    type: "Claim", children: [ { id: uuidv4(), tag: "Sub", type: "Inequality", children: [ createConst(), createObserve() ] }, createOne() ] })
const createAutoCallCash  = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Cond",     type: "Claim", children: [ createCall(), createCashCall(), createZero() ] });
const createAutoPutCash   = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Cond",     type: "Claim", children: [ createPut(), createCashPut(), createZero() ] });

const primitives =
  [ { id: uuidv4(), label: "Zero",      children: [], constructor: createZero }
  , { id: uuidv4(), label: "One",       children: [], constructor: createOne }
  , { id: uuidv4(), label: "Give",      children: [], constructor: createGive }
  , { id: uuidv4(), label: "And",       children: [], constructor: createAnd }
  , { id: uuidv4(), label: "Or",        children: [], constructor: createOr }
  , { id: uuidv4(), label: "Cond",      children: [], constructor: createCond }
  , { id: uuidv4(), label: "Scale",     children: [], constructor: createScale }
  , { id: uuidv4(), label: "When",      children: [], constructor: createWhen }
  , { id: uuidv4(), label: "Anytime",   children: [], constructor: createAnytime }
  , { id: uuidv4(), label: "Until",     children: [], constructor: createUntil } ];
const exercise : MenuEntry[] =
  [ { id: uuidv4(), label: "European",  children: [], constructor: createEuropean }
  , { id: uuidv4(), label: "American",  children: [], constructor: createAmerican }
  , { id: uuidv4(), label: "Perpetual", children: [], constructor: createPerpetual } ];
const election : MenuEntry[] =
  [ { id: uuidv4(), label: "AutoCall",  children: [], constructor: createAutoCall }
  , { id: uuidv4(), label: "AutoPut",   children: [], constructor: createAutoPut }
  , { id: uuidv4(), label: "Elected",   children: [], constructor: createElection } ];
const cashSettlement : MenuEntry[] =
  [ { id: uuidv4(), label: "Call",        children: [], constructor: createCashCall }
  , { id: uuidv4(), label: "Put",         children: [], constructor: createCashPut }
  , { id: uuidv4(), label: "Generic",     children: [], constructor: createCash } ];
const settlement : MenuEntry[] =
  [ { id: uuidv4(), label: "Physical",  children: [], constructor: createPhysical }
  , { id: uuidv4(), label: "Cash",      children: cashSettlement, constructor: undefined } ];
const fragments : MenuEntry[] =
  [ { id: uuidv4(), label: "Exercise", children: exercise, constructor: undefined }
  , { id: uuidv4(), label: "Election", children: election, constructor: undefined }
  , { id: uuidv4(), label: "Settlement", children: settlement, constructor: undefined } ];
const payoffs : MenuEntry[] =
  [ { id: uuidv4(), label: "AutoCallCash", children: [], constructor: createAutoCallCash }
  , { id: uuidv4(), label: "AutoPutCash", children: [], constructor: createAutoPutCash } ];
export const claimMenu : MenuEntry[] =
  [ { id: uuidv4(), label: "Primitives", children: primitives, constructor: undefined }
  , { id: uuidv4(), label: "Fragments", children: fragments, constructor: undefined }
  , { id: uuidv4(), label: "Payoffs", children: payoffs, constructor: undefined } ];

// ---------------
const createObservation   = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Observation",  type: "Observation", children: [] });
const createConst         = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Const",        type: "Observation", children: [ createValue("Decimal") ] });
const createObserve       = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Observe",      type: "Observation", children: [ createValue("Observable") ] });
const createAdd           = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Add",          type: "Observation", children: [ createObservation(), createObservation() ] });
const createSub           = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Sub",          type: "Observation", children: [ createObservation(), createObservation() ] });
const createNeg           = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Neg",          type: "Observation", children: [ createObservation() ] });
const createMul           = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Mul",          type: "Observation", children: [ createObservation(), createObservation() ] });
const createDiv           = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Div",          type: "Observation", children: [ createObservation(), createObservation() ] });

export const observationConstructors = [ createConst, createObserve, createAdd, createSub, createNeg, createMul, createDiv ];
export const observationTags = [ "Const", "Observe", "Add", "Sub", "Neg", "Mul", "Div" ];

// ---------------
const createInequality  = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Inequality", type: "Inequality", children: [] });
const createTimeGte     = () : ClaimTreeNode => ({ id: uuidv4(), tag: "TimeGte",    type: "Inequality", children: [ createValue("Date") ], text: "Date >=" });
const createLte         = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Lte",        type: "Inequality", children: [ createObservation(), createObservation() ], text: "<=" });
const createCall        = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Lte",        type: "Inequality", children: [ createConst(), createObserve() ], text: "<=" });
const createPut         = () : ClaimTreeNode => ({ id: uuidv4(), tag: "Lte",        type: "Inequality", children: [ createObserve(), createConst() ], text: "<=" });
export const inequalityConstructors = [ createTimeGte, createLte ];
export const inequalityTags = [ "TimeGte", "Lte" ];

// ---------------
export const createValue      = (type : string)         : ClaimTreeNode => ({ id: uuidv4(), tag: "Value",      type,          children: [] });
export const createObservable = (value : string)        : ClaimTreeNode => ({ id: uuidv4(), tag: "Observable", type: "Value", children: [], value, text: value });
export const createDecimal    = (value : string)        : ClaimTreeNode => ({ id: uuidv4(), tag: "Decimal",    type: "Value", children: [], value, text: value });
export const createDate       = (value : string)        : ClaimTreeNode => ({ id: uuidv4(), tag: "Date",       type: "Value", children: [], value, text: value.substring(0, 10) });
export const createAsset      = (value : InstrumentKey) : ClaimTreeNode => ({ id: uuidv4(), tag: "Asset",      type: "Value", children: [], value, text: value.id.unpack });

export const mapToText = (c : C) : Claim<Time, Decimal, string, string> => {
  switch (c.tag) {
    case "Zero":
      return c;
    case "One":
      return { ...c, value: c.value.id.unpack };
    case "Give":
      return { ...c, value: mapToText(c.value) };
    case "And":
      return { ...c, value: { a1: mapToText(c.value.a1), a2: mapToText(c.value.a2), as: c.value.as.map(mapToText) } };
    case "Or":
      return { ...c, value: { or1: { _1: "or1", _2: mapToText(c.value.or1._2) }, or2: { _1: "or1", _2: mapToText(c.value.or2._2) }, ors: c.value.ors.map((o, i) => ({ _1: "or" + i, _2: mapToText(o._2) })) } };
    case "Cond":
      return { ...c, value: { ...c.value, success: mapToText(c.value.success), failure: mapToText(c.value.failure) } };
    case "Scale":
      return { ...c, value: { ...c.value, claim: mapToText(c.value.claim) } };
    case "When":
    case "Until":
      return { ...c, value: { ...c.value, claim: mapToText(c.value.claim) } };
    case "Anytime":
      return { ...c, value: { ...c.value, electable: { _1: "anytime", _2: mapToText(c.value.electable._2) } } };
  };
}
