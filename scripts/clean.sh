#!/usr/bin/env bash
# Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# Use absolute paths to allow this script to be called from any location
script_dir=$(cd "$(dirname $0)"; pwd -P)
root_dir=$(cd ${script_dir}; cd ..; pwd -P)

# Clean
daml clean --project-root ${root_dir}/package/main/daml/Daml.Finance.App
daml clean --project-root ${root_dir}/package/main/daml/Daml.Finance.Setup

# Remove generated party file
if [[ -a ${root_dir}/ui/src/parties.json ]]; then
  rm ${root_dir}/ui/src/parties.json
fi
