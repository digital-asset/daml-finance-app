// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { TextField } from "@mui/material";
import useStyles from "./styles";

type TextInputProps = {
  label : string
  value : string
  setValue : React.Dispatch<React.SetStateAction<string>>
};

export const TextInput : React.FC<TextInputProps> = ({ label, value, setValue }) => {
  const classes = useStyles();
  return (
    <TextField className={classes.inputField} fullWidth label={label} type="text" value={value} onChange={e => setValue(e.target.value as string)} />
  );
};
