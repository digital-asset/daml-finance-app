#!/bin/bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

echo ""
DAR=($(daml damlc inspect ../.lib/contingent-claims-3.0.0.20220721.1.dar | head -1))
echo \"@daml.js/contingent-claims\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-holding-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-holding\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-instrument-base-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-instrument-base\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-instrument-bond-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-instrument-bond\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-instrument-equity-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-instrument-equity\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-instrument-generic-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-instrument-generic\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-holding-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-holding\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-instrument-base-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-base\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-instrument-equity-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-equity\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-instrument-generic-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-instrument-generic\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-lifecycle-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-lifecycle\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-settlement-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-settlement\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-interface-types-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-interface-types\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-lifecycle-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-lifecycle\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-refdata-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-refdata\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-settlement-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-settlement\": \"file:daml.js/${DAR[1]}\",

DAR=($(daml damlc inspect ../.lib/daml-finance-util-0.1.3.dar | head -1))
echo \"@daml.js/daml-finance-util\": \"file:daml.js/${DAR[1]}\",

echo ""
