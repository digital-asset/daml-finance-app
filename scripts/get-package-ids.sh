#!/usr/bin/env bash
# Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

echo ""
DAR=($(daml damlc inspect .lib/contingent-claims-core-4.0.0.dar | head -1))
echo \"@daml.js/contingent-claims-core\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-account-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-account\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-claims-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-claims\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-data-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-data\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-holding-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-holding\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-base-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-base\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-bond-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-bond\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-equity-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-equity\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-generic-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-generic\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-swap-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-swap\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-token-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-token\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-lifecycle-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-lifecycle\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-settlement-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-settlement\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-types-common-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-types-common\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-types-date-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-types-date\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-util-4.0.0.dar | head -1))
echo \"@daml.js/daml-finance-interface-util\": \"file:daml.js/${DAR[1]}\",

echo ""
