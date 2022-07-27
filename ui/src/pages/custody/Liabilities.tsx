// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Holdings } from "./Holdings";

export const Liabilities : React.FC = () => {
  return <Holdings showAssets={false} />;
};
