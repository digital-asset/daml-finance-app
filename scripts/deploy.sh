#!/usr/bin/env bash
# Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# Use absolute paths to allow this script to be called from any location
script_dir=$(cd "$(dirname $0)"; pwd -P)
root_dir=$(cd ${script_dir}; cd ..; pwd -P)

clean () {
    if [[ -d ${root_dir}/.dars ]]; then
    rm -r ${root_dir}/.dars
    fi
}

build () {
    DAML_PROJECT=${root_dir}/package/main/daml/Daml.Finance.Interface daml build
    DAML_PROJECT=${root_dir}/package/main/daml/Daml.Finance.App daml build
    DAML_PROJECT=${root_dir}/package/main/daml/Daml.Finance.Setup daml build

    # Copy all package dars into a dedicated folder
    mkdir -p ${root_dir}/.dars
    cp ${root_dir}/package/main/daml/*/.daml/dist/* ${root_dir}/.dars/
}

start () {

    mkdir -p ${root_dir}/temp
    output_file=$(mktemp -p ${root_dir}/temp)

    daml sandbox > ${output_file} & 
    sandbox_pid=$!

    echo "Sandbox running with pid: ${sandbox_pid}"
    tail -n0 -f ${output_file} | sed '/Canton sandbox is ready/ q'

    rm ${root_dir}/temp/*

    echo "${sandbox_pid}" > ${root_dir}/temp/pid
}

dars() {
    find ${root_dir}/.dars/ -name "*${1}.dar" -exec daml ledger upload-dar --host localhost --port 6865 {} \;
}

setup () {
    script_name=$(yq e '.init-script' daml.yaml)
    script_options=$(yq e '.script-options[]' daml.yaml | tr '\n' ' ')
    dar_name="${root_dir}/.dars/daml-finance-app-setup-${1}.dar"
    if [ ! -f ${dar_name} ]; then
        echo "Setup dar not found!"
    fi
    echo "Running the script: ${script_name}"
    daml script --dar ${dar_name} --script-name ${script_name} --ledger-host localhost --ledger-port 6865 ${script_options}
}

json() {
    json_options=$(yq e '.json-api-options[]' daml.yaml | tr '\n' ' ')
    daml json-api --allow-insecure-tokens ${json_options} 
}

stop () {
    sandbox_pid=$(cat "${root_dir}/temp/pid")  
    echo "Stopping sandbox with pid: ${sandbox_pid}"
    kill ${sandbox_pid}
}

operation=${1}
extension=${2:-"4.0.0"}

case $operation in
  start)
    start
    ;;

  stop)
    stop
    ;;

  build)
    build
    ;;

  dars)
    dars ${extension}
    ;;

  setup)
    setup ${extension}
    ;;

  json)
    json
    ;;

esac