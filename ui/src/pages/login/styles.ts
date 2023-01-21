// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  header: {
    textAlign: "center",
    position: "absolute",
    top: "5%",
    left: "50%",
    transform: "translate(-50%, 0%)"
  },
  subHeader: {
    textAlign: "center",
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translate(-50%, 0%)"
  },
  versionText: {
    textAlign: "right",
    position: "absolute",
    top: "0%",
    right: "0%",

  },
  progressBar: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, 0%)",
    width: "50%"
  },
  loginContainer: {
    // height: "100vh",
    width: "300px",
    // display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  loginField: {
    width: "300px",
  },
  loginButton: {
    width: "300px",
    borderRadius: "5px"
  },
}));
