#!/usr/bin/env bash
# Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# Use absolute paths to allow this script to be called from any location
script_dir=$(cd "$(dirname $0)"; pwd -P)
root_dir=$(cd ${script_dir}; cd ..; pwd -P)

# Build
DAML_PROJECT=${root_dir}/package/main/daml/Daml.Finance.App daml build
DAML_PROJECT=${root_dir}/package/main/daml/Daml.Finance.Setup daml build

if [[ -d ${root_dir}/.dars ]]; then
  rm -r ${root_dir}/.dars
fi

# Copy all package dars into a dedicated folder
mkdir ${root_dir}/.dars
cp ${root_dir}/package/main/daml/*/.daml/dist/* ${root_dir}/.dars/
