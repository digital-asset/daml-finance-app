#!/usr/bin/env bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

echo ""
DAR=($(daml damlc inspect .lib/contingent-claims-core-0.1.0.dar | head -1))
echo \"@daml.js/contingent-claims-core\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-account-0.1.2.dar | head -1))
echo \"@daml.js/daml-finance-interface-account\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-claims-0.1.7.dar | head -1))
echo \"@daml.js/daml-finance-interface-claims\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-data-0.1.6.dar | head -1))
echo \"@daml.js/daml-finance-interface-data\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-holding-0.1.7.dar | head -1))
echo \"@daml.js/daml-finance-interface-holding\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-base-0.1.7.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-base\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-bond-0.1.7.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-bond\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-equity-0.1.8.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-equity\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-generic-0.1.8.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-generic\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-swap-0.1.8.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-swap\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-instrument-token-0.1.7.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-token\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-lifecycle-0.1.8.dar | head -1))
echo \"@daml.js/daml-finance-interface-lifecycle\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-settlement-0.1.8.dar | head -1))
echo \"@daml.js/daml-finance-interface-settlement\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-types-0.1.6.dar | head -1))
echo \"@daml.js/daml-finance-interface-types\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect .lib/daml-finance-interface-util-0.1.6.dar | head -1))
echo \"@daml.js/daml-finance-interface-util\": \"file:daml.js/${DAR[1]}\",

echo ""
