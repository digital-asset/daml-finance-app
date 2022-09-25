#!/bin/bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -eu

# Create .lib directory if it doesn't exist
if [[ ! -d .lib ]]; then
  mkdir .lib
fi

get_dependency () {
  local package_name=$1
  local module_name=$2
  local version=$3
  local url="https://github.com/digital-asset/daml-finance/releases/download/${module_name}/${version}/${package_name}-${version}.dar"
  echo "Getting dependency ${package_name} v${version}"
  if [[ ! -a ".lib/${package_name}-${version}.dar" ]]; then curl -Lf# $url -o .lib/$package_name-$version.dar; fi
}

cc_version="3.0.0.20220721.1"
if [[ ! -a ".lib/contingent-claims-${cc_version}.dar" ]]; then curl -Lf# "https://github.com/digital-asset/contingent-claims/releases/download/v${cc_version}/contingent-claims-${cc_version}.dar" -o .lib/contingent-claims-${cc_version}.dar; fi

get_dependency daml-finance-data                          Daml.Finance.Data                         0.1.4
get_dependency daml-finance-holding                       Daml.Finance.Holding                      0.1.4
get_dependency daml-finance-instrument-bond               Daml.Finance.Instrument.Bond              0.1.5
get_dependency daml-finance-instrument-equity             Daml.Finance.Instrument.Equity            0.1.5
get_dependency daml-finance-instrument-generic            Daml.Finance.Instrument.Generic           0.1.5
get_dependency daml-finance-instrument-token              Daml.Finance.Instrument.Token             0.1.4
get_dependency daml-finance-interface-claims              Daml.Finance.Interface.Claims             0.1.4
get_dependency daml-finance-interface-data                Daml.Finance.Interface.Data               0.1.4
get_dependency daml-finance-interface-holding             Daml.Finance.Interface.Holding            0.1.4
get_dependency daml-finance-interface-instrument-base     Daml.Finance.Interface.Instrument.Base    0.1.4
get_dependency daml-finance-interface-instrument-bond     Daml.Finance.Interface.Instrument.Bond    0.1.4
get_dependency daml-finance-interface-instrument-equity   Daml.Finance.Interface.Instrument.Equity  0.1.5
get_dependency daml-finance-interface-instrument-generic  Daml.Finance.Interface.Instrument.Generic 0.1.5
get_dependency daml-finance-interface-instrument-token    Daml.Finance.Interface.Instrument.Token   0.1.4
get_dependency daml-finance-interface-lifecycle           Daml.Finance.Interface.Lifecycle          0.1.5
get_dependency daml-finance-interface-settlement          Daml.Finance.Interface.Settlement         0.1.5
get_dependency daml-finance-interface-types               Daml.Finance.Interface.Types              0.1.4
get_dependency daml-finance-interface-util                Daml.Finance.Interface.Util               0.1.4
get_dependency daml-finance-lifecycle                     Daml.Finance.Lifecycle                    0.1.5
get_dependency daml-finance-settlement                    Daml.Finance.Settlement                   0.1.5
get_dependency daml-finance-util                          Daml.Finance.Util                         0.1.4
