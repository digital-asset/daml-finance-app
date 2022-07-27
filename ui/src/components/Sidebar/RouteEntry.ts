// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type RouteEntry = {
  path : string
  element : JSX.Element
  label? : string
  icon? : JSX.Element
  children? : RouteEntry[]
  divider? : boolean
}

export const getChildren = (e : RouteEntry) : RouteEntry[] => {
  return !!e.children ? e.children.concat(e.children.flatMap(c => getChildren(c))) : [];
}
