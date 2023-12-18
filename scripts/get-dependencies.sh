#!/usr/bin/env bash
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

get_dependency contingent-claims-core                               ContingentClaims.Core                                 2.0.1
get_dependency contingent-claims-lifecycle                          ContingentClaims.Lifecycle                            2.0.1
get_dependency contingent-claims-valuation                          ContingentClaims.Valuation                            0.2.2
get_dependency daml-finance-account                                 Daml.Finance.Account                                  3.0.0
get_dependency daml-finance-claims                                  Daml.Finance.Claims                                   2.1.0
get_dependency daml-finance-data                                    Daml.Finance.Data                                     3.0.0
get_dependency daml-finance-holding                                 Daml.Finance.Holding                                  3.0.0
get_dependency daml-finance-instrument-bond                         Daml.Finance.Instrument.Bond                          2.0.0
get_dependency daml-finance-instrument-equity                       Daml.Finance.Instrument.Equity                        0.4.0
get_dependency daml-finance-instrument-generic                      Daml.Finance.Instrument.Generic                       3.0.0
get_dependency daml-finance-instrument-option                       Daml.Finance.Instrument.Option                        0.3.0
get_dependency daml-finance-instrument-structuredproduct            Daml.Finance.Instrument.StructuredProduct             0.1.0
get_dependency daml-finance-instrument-swap                         Daml.Finance.Instrument.Swap                          0.4.0
get_dependency daml-finance-instrument-token                        Daml.Finance.Instrument.Token                         3.0.0
get_dependency daml-finance-interface-account                       Daml.Finance.Interface.Account                        3.0.0
get_dependency daml-finance-interface-claims                        Daml.Finance.Interface.Claims                         3.0.0
get_dependency daml-finance-interface-data                          Daml.Finance.Interface.Data                           3.1.0
get_dependency daml-finance-interface-holding                       Daml.Finance.Interface.Holding                        3.0.0
get_dependency daml-finance-interface-instrument-base               Daml.Finance.Interface.Instrument.Base                3.0.0
get_dependency daml-finance-interface-instrument-bond               Daml.Finance.Interface.Instrument.Bond                2.0.0
get_dependency daml-finance-interface-instrument-equity             Daml.Finance.Interface.Instrument.Equity              0.4.0
get_dependency daml-finance-interface-instrument-generic            Daml.Finance.Interface.Instrument.Generic             3.0.0
get_dependency daml-finance-interface-instrument-option             Daml.Finance.Interface.Instrument.Option              0.3.0
get_dependency daml-finance-interface-instrument-structuredproduct  Daml.Finance.Interface.Instrument.StructuredProduct   0.1.0
get_dependency daml-finance-interface-instrument-swap               Daml.Finance.Interface.Instrument.Swap                0.4.0
get_dependency daml-finance-interface-instrument-token              Daml.Finance.Interface.Instrument.Token               3.0.0
get_dependency daml-finance-interface-instrument-types              Daml.Finance.Interface.Instrument.Types               1.0.0
get_dependency daml-finance-interface-lifecycle                     Daml.Finance.Interface.Lifecycle                      3.0.0
get_dependency daml-finance-interface-settlement                    Daml.Finance.Interface.Settlement                     3.0.0
get_dependency daml-finance-interface-types-common                  Daml.Finance.Interface.Types.Common                   2.0.0
get_dependency daml-finance-interface-types-date                    Daml.Finance.Interface.Types.Date                     2.1.0
get_dependency daml-finance-interface-util                          Daml.Finance.Interface.Util                           2.1.0
get_dependency daml-finance-lifecycle                               Daml.Finance.Lifecycle                                3.0.0
get_dependency daml-finance-settlement                              Daml.Finance.Settlement                               3.0.0
get_dependency daml-finance-util                                    Daml.Finance.Util                                     3.1.0
