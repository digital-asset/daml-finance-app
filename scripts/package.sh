#!/usr/bin/env bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

# ---- Package UI ----
root_dir=$(cd "$(dirname $0)"; cd ..; pwd -P)
ui_dir=$root_dir/ui

red='\033[0;31m'
colour_off='\033[0m'

cd $ui_dir
name=$(npm pkg get name | sed 's/"//g')
version=$(npm pkg get version | sed 's/"//g')
zipName=$name-$version.zip

zip -r $zipName build
cp $zipName ../.dars
