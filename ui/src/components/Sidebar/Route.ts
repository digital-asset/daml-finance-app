// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type Entry = {
  label : string
  path : string
  element : JSX.Element
  action? : boolean
}

export type Path = {
  path : string
  element : JSX.Element
}
