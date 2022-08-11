// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography } from "@mui/material";
import useStyles from "./styles";
import { useUserDispatch, loginUser } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import { Box } from "@mui/system";
import { useParties } from "../../hooks/Parties";

export const Form : React.FC = () => {
  const classes = useStyles();
  const branding = useBranding();
  const { getParty, getToken } = useParties();

  const userDispatch = useUserDispatch();
  const navigate = useNavigate();

  const [, setError] = useState(false);
  const [loginValue, setLoginValue] = useState("");

  const loginKey = async (e : any) => {
    if (e.key === "Enter") await login();
  }

  const login = async () => {
    await loginUser(userDispatch, loginValue, getParty(loginValue), getToken(loginValue), navigate, setError);
  }

  return (
    <>
      {branding.loginLogo}
      <Typography variant="h2" style={{ position: "absolute", top: "50%", left: "34%" }}>Digital Market Infrastructure</Typography>
      <Box className={classes.loginContainer} style={{ top: branding.loginY, left: branding.loginX }}>
        <TextField
          className={classes.loginField}
          // InputProps={{ style: { color: "white" } }}
          value={loginValue}
          onChange={e => setLoginValue(e.target.value)}
          onKeyDown={loginKey}
          margin="normal"
          placeholder="Username"
          fullWidth
        />
        <Button
          className={classes.loginButton}
          disabled={loginValue.length === 0}
          onClick={login}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          Login
        </Button>
      </Box>
    </>
  );
}
