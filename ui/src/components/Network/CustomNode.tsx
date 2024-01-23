// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { memo } from "react";
import { NodeProps } from "react-flow-renderer";

const CustomNode = ({ data }: NodeProps) => {
  return (
    <>
      {data?.label}
    </>
  );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);
