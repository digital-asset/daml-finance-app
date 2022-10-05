// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import classnames from "classnames";
import useStyles from "./styles";
import { SelectInputProps } from "./SelectInput";

export const ToggleInput : React.FC<SelectInputProps> = ({ label, value, setValue, values }) => {
  const classes = useStyles();
  return (
    <ToggleButtonGroup className={classnames(classes.inputField, classes.fullWidth)} value={value} exclusive onChange={(_, v) => { if (v !== null) setValue(v); }}>
      {values.map((v, i) => (<ToggleButton key={i} className={classes.fullWidth} value={v.value}>{v.display}</ToggleButton>))}
    </ToggleButtonGroup>
  );
};
