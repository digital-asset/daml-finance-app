// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { DatePicker } from "@mui/lab";
import useStyles from "./styles";

type DateInputProps = {
  label : string
  value : Date | null
  setValue : React.Dispatch<React.SetStateAction<Date | null>>
};

export const DateInput : React.FC<DateInputProps> = ({ label, value, setValue }) => {
  const classes = useStyles();
  return (
    <DatePicker className={classes.inputField} inputFormat="yyyy-MM-dd" label={label} value={value} onChange={setValue} renderInput={(props : TextFieldProps) => <TextField {...props} fullWidth />} />
  );
};
