// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Select, MenuItem, MenuProps, FormControl, InputLabel } from "@mui/material";
import useStyles from "./styles";
import { InstrumentAggregate } from "../../context/InstrumentContext";

export type SelectInputValue = {
  value : string
  display : string
};

export type SelectInputProps = {
  label : string
  value : string
  setValue : React.Dispatch<React.SetStateAction<string>>
  values : SelectInputValue[]
};

export const toValues = (instruments : InstrumentAggregate[]) : SelectInputValue[] => {
  return instruments.map(c => ({ value: c.payload.id.unpack, display: c.payload.id.unpack + " - " + c.payload.description }));
};

export const SelectInput : React.FC<SelectInputProps> = ({ label, value, setValue, values }) => {
  const classes = useStyles();
  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" }, sx: { borderRadius: 0 } };
  return (
    <FormControl className={classes.inputField} fullWidth>
      <InputLabel className={classes.selectLabel}>{label}</InputLabel>
      <Select value={value} onChange={e => setValue(e.target.value as string)} MenuProps={menuProps}>
        {values.map((v, i) => (<MenuItem key={i} value={v.value}>{v.display}</MenuItem>))}
      </Select>
    </FormControl>
  );
};
