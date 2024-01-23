// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";

export type MessageProps = {
  marginTop? : number
  text : string
}

export const Message : React.FC<MessageProps> = ({ marginTop = 350, text }) => {
  return (
    <div style={{display: 'flex', justifyContent: 'center', marginTop: marginTop }}>
      <h1>{text}</h1>
    </div>);
};
