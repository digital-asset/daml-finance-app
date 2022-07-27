// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
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
  // loginInput: {
  //   color: "#BBB!important",
  //   borderColor: "#BBB!important",
  //   borderWidth: "1px!important",
  //   borderRadius: "0px!important"
  // },
  // loginInputFocused: {
  //   color: theme.palette.text.primary + "!important",
  //   borderColor: theme.palette.text.primary + "!important",
  //   borderWidth: "1px!important",
  //   borderRadius: "0px!important"
  // },
}));
