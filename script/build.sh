#!/bin/bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# Build
DAML_PROJECT=../package/main/daml/Daml.Finance.App daml build
DAML_PROJECT=../package/main/daml/Daml.Finance.Setup daml build

if [[ -d ../.dars ]]; then
  rm -r ../.dars
fi

# Copy all package dars into a dedicated folder
mkdir ../.dars
cp ../package/main/daml/*/.daml/dist/* ../.dars/

# daml build --project-root ../package/test/daml/Daml.Finance.App.Test
