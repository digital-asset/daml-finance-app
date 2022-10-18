// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Select, MenuItem, MenuProps, FormControl, Icon } from "@mui/material";
import useStyles from "./styles";
import Swap from "../../images/swap.svg";

export type ActionSelectProps = {
  value : string
  setValue : (value : string) => void
  values : string[]
};

export const ActionSelect : React.FC<ActionSelectProps> = ({ value, setValue, values }) => {
  const classes = useStyles();
  const icon = (props : any) => <Icon {...props}><img alt="" src={Swap}/></Icon>;
  const menuProps : Partial<MenuProps> = { anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" } };
  return (
    <FormControl>
      <Select className={classes.actionSelect} value={value} onChange={e => setValue(e.target.value as string)} disableUnderline MenuProps={menuProps} IconComponent={icon}>
        {values.map((v, i) => (<MenuItem key={i} value={v}>{v}</MenuItem>))}
      </Select>
    </FormControl>
  );
};
