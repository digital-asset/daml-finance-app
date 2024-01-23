// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CircularProgress } from "@mui/material"

export type SpinnerProps = {
  size? : number
  marginTop? : number
}

export const Spinner : React.FC<SpinnerProps> = ({ size = 100, marginTop = 350 }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop }}>
      <CircularProgress size={size} />
    </div>
  );
};
