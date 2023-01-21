#!/usr/bin/env bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

# ---- Deploy to Daml Hub ----
root_dir=$(cd "$(dirname $0)"; cd ..; pwd -P)
ui_dir=$root_dir/ui

red='\033[0;31m'
colour_off='\033[0m'

echo "Generating token: "
token=$(curl -s -XPOST -H "Authorization: Basic c2NyZWQtMzczMzRmZDktODA5YS00NWFiLTljYjQtMDAwZTlhZTk4NzFmOkJMZ1JOaURZTmJ2aDlTNzNzcEtZ" 'https://login.hub.daml.com/auth/site-credentials/login')
damlhub token $token | jq -r '.success'

project_name=default
ledger_name=ledger$(echo $RANDOM | md5sum | head -c 4; echo)

# Create project
echo -n "Creating project: "
project_id=$(damlhub project ensure $project_name 2>&1 | tail -n +3 | jq -r '.id')
echo $project_id

# Create ledger
echo -n "Creating ledger: "
ledger_id=$(damlhub ledger add $project_id $ledger_name 2>&1 | tail -n +3 | jq -r '.id')
echo $ledger_id

# Wait for ledger
while true; do
    status=$(damlhub ledger health $ledger_id 2>&1 | tail -n +3 | jq -r '.status')
    if [ "$status" == "200" ]; then break; else echo -n "."; fi
    sleep 5
done
echo "."

# Upload files
cd $ui_dir
ui_name=$(npm pkg get name | sed 's/"//g')
ui_version=$(npm pkg get version | sed 's/"//g')
ui_file=.dars/$ui_name-$ui_version.zip
cd ..
dar_name=$(cat package/main/daml/Daml.Finance.App.Setup/daml.yaml | grep name | cut -d " " -f 2)
dar_version=$(cat package/main/daml/Daml.Finance.App.Setup/daml.yaml | grep ^version | cut -d " " -f 2)
dar_file=.dars/$dar_name-$dar_version.dar

echo -n "Uploading DAR: "
hash_dar=$(damlhub artifact put $dar_file 2>&1 | tail -n +3 | jq -r '.artifact_hash')
echo $hash_dar

echo -n "Uploading UI: "
hash_ui=$(damlhub artifact put $ui_file 2>&1 | tail -n +3 | jq -r '.artifact_hash')
echo $hash_ui

# Deploy artifacts
echo "Installing DAR: "
damlhub workspace deploy $hash_dar $ledger_id 2>&1 | tail -n +3 | jq -r '.createdAt'
echo "Installing UI: "
damlhub workspace deploy $hash_ui $ledger_id 2>&1 | tail -n +3 | jq -r '.createdAt'

echo "Deploying DAR"
damlhub ledger dar $ledger_id $hash_dar 2>&1 | tail -n +4
echo "Deploying UI"
damlhub ledger ui $ledger_id $hash_ui 2>&1 | tail -n +4

echo "Deployment completed at: https://$ledger_id.daml.app"

# ledger_id=a38wn9e27grvjaj9
# hash_ui=$(damlhub artifact put .dars/daml-finance-app-ui-0.0.2.zip 2>&1 | tail -n +3 | jq -r '.artifact_hash')
# hash_dar=$(damlhub artifact put .dars/daml-finance-app-setup-0.0.2.dar 2>&1 | tail -n +3 | jq -r '.artifact_hash')
# damlhub workspace deploy $hash_dar $ledger_id 2>&1 | tail -n +3
# damlhub workspace deploy $hash_ui $ledger_id 2>&1 | tail -n +3
# damlhub ledger dar $ledger_id $hash_dar
# damlhub ledger ui $ledger_id $hash_ui
