// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useUser } from "../../context/UserContext";
import { useBranding } from "../../context/BrandingContext";
import useStyles from "./styles";

export const Form : React.FC = () => {
  const cls = useStyles();
  const navigate = useNavigate();
  const branding = useBranding();
  const { login } = useUser();
  const [name, setName] = useState("");

  const loginKey = async (e : any) => {
    if (e.key === "Enter") await loginUser();
  }

  const loginUser = async () => {
    login(name);
    navigate("/app");
  }

  return (
    <>
      {branding.background}
      <Typography variant="h1" className={cls.header}>Daml Finance</Typography>
      <Box className={cls.loginContainer} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 0%)" }}>
        <TextField
          className={cls.loginField}
          // InputProps={{ style: { color: "white" } }}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={loginKey}
          margin="normal"
          placeholder="Username"
          fullWidth
        />
        <Button
          className={cls.loginButton}
          disabled={name.length === 0}
          onClick={loginUser}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          style={{ borderRadius: 20 }}
        >
          Login
        </Button>
      </Box>
      <IconButton size="large" color="inherit" onClick={() => navigate("/login/portal")} style={{ position: "absolute", top: "1%", left: "98%", transform: "translate(-50%, 0%)" }}>
        <ExitToApp fontSize="large" />
      </IconButton>
    </>
  );
}
