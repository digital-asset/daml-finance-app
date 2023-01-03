#!/usr/bin/env bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

echo ""
DAR=($(daml damlc inspect .lib/daml-finance/ContingentClaims.Core/1.0.0/contingent-claims-core-1.0.0.dar | head -1))
echo \"@daml.js/contingent-claims-core\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Account/1.0.0/daml-finance-interface-account-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-account\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Claims/1.0.0/daml-finance-interface-claims-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-claims\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-data-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-data\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Holding/1.0.0/daml-finance-interface-holding-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-holding\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Base/1.0.0/daml-finance-interface-instrument-base-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-base\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Bond/0.2.0/daml-finance-interface-instrument-bond-0.2.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-bond\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Equity/0.2.0/daml-finance-interface-instrument-equity-0.2.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-equity\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Generic/1.0.0/daml-finance-interface-instrument-generic-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-generic\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Swap/0.2.0/daml-finance-interface-instrument-swap-0.2.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-swap\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Instrument.Token/1.0.0/daml-finance-interface-instrument-token-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-token\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Lifecycle/1.0.0/daml-finance-interface-lifecycle-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-lifecycle\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Settlement/1.0.0/daml-finance-interface-settlement-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-settlement\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Types.Common/1.0.0/daml-finance-interface-types-common-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-types-common\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Types.Date/1.0.0/daml-finance-interface-types-date-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-types-date\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance/Daml.Finance.Interface.Util/1.0.0/daml-finance-interface-util-1.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-util\": \"file:daml.js/${DAR[1]}\",

echo ""
