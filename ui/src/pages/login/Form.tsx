// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import useStyles from "./styles";
import { useUserDispatch, loginUser } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import { Box } from "@mui/system";
import { useParties } from "../../context/PartiesContext";
import ExitToApp from "@mui/icons-material/ExitToApp";

export const Form : React.FC = () => {
  const classes = useStyles();
  const branding = useBranding();
  const { getParty, getToken } = useParties();

  const userDispatch = useUserDispatch();
  const navigate = useNavigate();

  const [, setError] = useState(false);
  const [name, setName] = useState("");

  const loginKey = async (e : any) => {
    if (e.key === "Enter") await login();
  }

  const login = async () => {
    const party = getParty(name);
    const token = getToken(party);
    await loginUser(userDispatch, name, party, token, navigate, setError);
  }

  return (
    <>
      {branding.loginLogo}
      <Typography variant="h2" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 0%)" }}>Daml Finance</Typography>
      <Box className={classes.loginContainer} style={{ position: "absolute", top: branding.loginY, left: "50%", transform: "translate(-50%, 0%)" }}>
        <TextField
          className={classes.loginField}
          // InputProps={{ style: { color: "white" } }}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={loginKey}
          margin="normal"
          placeholder="Username"
          fullWidth
        />
        <Button
          className={classes.loginButton}
          disabled={name.length === 0}
          onClick={login}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          Login
        </Button>
      </Box>
      <IconButton size="large" color="inherit" onClick={() => navigate("/login")} style={{ position: "absolute", top: "90%", left: "50%", transform: "translate(-50%, 0%)" }}>
        <ExitToApp fontSize="large" />
      </IconButton>
    </>
  );
}
