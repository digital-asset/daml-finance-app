// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeStyles, createStyles } from "@mui/styles";

export default makeStyles((theme : any) => createStyles({
  tableCell: {
    verticalAlign: "center",
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: "0.75rem"
  },
  tableCellSmall: {
    verticalAlign: "center",
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: "0.7rem"
  },
  tableRow: {
    height: "auto"
  },
  heading: {
    paddingBottom: "20px",
    textAlign: "center"
  },
  choiceButton: {
    paddingTop: 3,
    paddingBottom: 0,
    marginRight: 5,
    borderRadius: 15
  },
  actionButton: {
    margin: 20,
    borderRadius: 20
  },
  buttonMargin: {
    marginTop: "20px",
    borderRadius: 20
  },
  inputField: {
    marginTop: 10,
  },
  inputFieldLabel: {
    color: theme.palette.grey[400]
  },
  selectLabel: {
    marginLeft: -14,
    marginTop: 4
  },
  inputFieldPlaceholder: {
    color: theme.palette.text.primary + "!important"
  },
  width90: {
    width: "90%"
  },
  width85: {
    width: "85%"
  },
  width50: {
    width: "50%"
  },
  default: {
    fill: "#fff",
  },
  green: {
    fill: "#009900",
  },
  yellow: {
    fill: "#999900"
  },
  red: {
    fill: "#990000"
  },
  chipYellow: {
    color: "white",
    backgroundColor: "#999900",
    verticalAlign: "top",
  },
  chipGreen: {
    color: "white",
    backgroundColor: "#009900",
    verticalAlign: "top",
  },
  paper: {
    padding: 20,
    marginBottom: 20,
  },
  paperHeading: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  defaultHeading: {
    color: theme.palette.primary.main,
    marginTop: 15,
    marginBottom: 15
  },
  centered: {
    textAlign: "center"
  },
  dot: {
    padding: 0,
    borderColor: "#009900",
    backgroundColor: "white",
  },
  mobileScreen: {
    height: `calc(100vh - 144px)`
  },
  fullWidth: {
    width: "100%"
  },
  buttonGreen: {
    root: {
      '&$selected': {
        backgroundColor: "green",
        '& + &': {
          backgroundColor: "green",
          borderLeft: 0,
          marginLeft: 0,
        },
      }
    }
  },
  acc: {
    backgroundColor: theme.palette.secondary.main
  },
  timeline: {
    marginTop: 10,
    marginBottom: 30
  }
}));
