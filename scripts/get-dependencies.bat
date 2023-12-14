:: Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
:: SPDX-License-Identifier: Apache-2.0

@echo off

:: Create .lib directory if it doesn't exist
if not exist ".\.lib\" mkdir .\.lib

call :get_dependency contingent-claims-core                               ContingentClaims.Core                                 2.0.0.99.20231127.1
call :get_dependency contingent-claims-lifecycle                          ContingentClaims.Lifecycle                            2.0.0.99.20231127.1
call :get_dependency contingent-claims-valuation                          ContingentClaims.Valuation                            0.2.1.99.20231127.1
call :get_dependency daml-finance-account                                 Daml.Finance.Account                                  2.99.0.20231127.1
call :get_dependency daml-finance-claims                                  Daml.Finance.Claims                                   2.0.99.20231127.1
call :get_dependency daml-finance-data                                    Daml.Finance.Data                                     2.99.0.20231127.1
call :get_dependency daml-finance-holding                                 Daml.Finance.Holding                                  2.99.0.20231127.1
call :get_dependency daml-finance-instrument-bond                         Daml.Finance.Instrument.Bond                          1.99.0.20231127.1
call :get_dependency daml-finance-instrument-equity                       Daml.Finance.Instrument.Equity                        0.3.99.20231127.1
call :get_dependency daml-finance-instrument-generic                      Daml.Finance.Instrument.Generic                       2.99.0.20231127.1
call :get_dependency daml-finance-instrument-option                       Daml.Finance.Instrument.Option                        0.2.99.20231127.1
call :get_dependency daml-finance-instrument-structuredproduct            Daml.Finance.Instrument.StructuredProduct             0.0.99.20231127.1
call :get_dependency daml-finance-instrument-swap                         Daml.Finance.Instrument.Swap                          0.3.99.20231127.1
call :get_dependency daml-finance-instrument-token                        Daml.Finance.Instrument.Token                         2.99.0.20231127.1
call :get_dependency daml-finance-interface-account                       Daml.Finance.Interface.Account                        2.99.0.20231127.1
call :get_dependency daml-finance-interface-claims                        Daml.Finance.Interface.Claims                         2.99.0.20231127.1
call :get_dependency daml-finance-interface-data                          Daml.Finance.Interface.Data                           3.0.99.20231127.1
call :get_dependency daml-finance-interface-holding                       Daml.Finance.Interface.Holding                        2.99.0.20231127.1
call :get_dependency daml-finance-interface-instrument-base               Daml.Finance.Interface.Instrument.Base                2.99.0.20231127.1
call :get_dependency daml-finance-interface-instrument-bond               Daml.Finance.Interface.Instrument.Bond                1.99.0.20231127.1
call :get_dependency daml-finance-interface-instrument-equity             Daml.Finance.Interface.Instrument.Equity              0.3.99.20231127.1
call :get_dependency daml-finance-interface-instrument-generic            Daml.Finance.Interface.Instrument.Generic             2.99.0.20231127.1
call :get_dependency daml-finance-interface-instrument-option             Daml.Finance.Interface.Instrument.Option              0.2.99.20231127.1
call :get_dependency daml-finance-interface-instrument-structuredproduct  Daml.Finance.Interface.Instrument.StructuredProduct   0.0.99.20231127.1
call :get_dependency daml-finance-interface-instrument-swap               Daml.Finance.Interface.Instrument.Swap                0.3.99.20231127.1
call :get_dependency daml-finance-interface-instrument-token              Daml.Finance.Interface.Instrument.Token               2.99.0.20231127.1
call :get_dependency daml-finance-interface-instrument-types              Daml.Finance.Interface.Instrument.Types               0.99.0.20231127.1
call :get_dependency daml-finance-interface-lifecycle                     Daml.Finance.Interface.Lifecycle                      2.99.0.20231127.1
call :get_dependency daml-finance-interface-settlement                    Daml.Finance.Interface.Settlement                     2.99.0.20231127.1
call :get_dependency daml-finance-interface-types-common                  Daml.Finance.Interface.Types.Common                   1.99.0.20231127.1
call :get_dependency daml-finance-interface-types-date                    Daml.Finance.Interface.Types.Date                     2.0.99.20231127.1
call :get_dependency daml-finance-interface-util                          Daml.Finance.Interface.Util                           2.0.99.20231127.1
call :get_dependency daml-finance-lifecycle                               Daml.Finance.Lifecycle                                2.99.0.20231127.1
call :get_dependency daml-finance-settlement                              Daml.Finance.Settlement                               2.99.0.20231127.1
call :get_dependency daml-finance-util                                    Daml.Finance.Util                                     3.0.99.20231127.1

exit /b 0

:get_dependency
  set package_name=%~1
  set module_name=%~2
  set version=%~3
  set url="https://github.com/digital-asset/daml-finance/releases/download/%module_name%/%version%/%package_name%-%version%.dar"
  echo Getting dependency %package_name% v%version%
  if not exist ".lib/%package_name%-%version%.dar" (curl -Lf# %url% -o .lib/%package_name%-%version%.dar)
  exit /b 0
