// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

type DetailButtonProps = {
  path : string
}

export const DetailButton : React.FC<DetailButtonProps> = ({ path }) => {
  const navigate = useNavigate()

  return (
    <IconButton color="primary" size="small" component="span" onClick={() => navigate(path)}>
      <KeyboardArrowRight fontSize="small"/>
    </IconButton>
  );
};
