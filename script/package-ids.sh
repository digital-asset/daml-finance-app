#!/bin/bash
# Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

DAR1=($(daml damlc inspect ../lib/daml-finance-asset-0.1.0.dar | head -1))
DAR2=($(daml damlc inspect ../lib/daml-finance-settlement-0.1.0.dar | head -1))
DAR3=($(daml damlc inspect ../lib/daml-finance-lifecycle-0.1.0.dar | head -1))
DAR4=($(daml damlc inspect ../lib/daml-finance-derivative-0.1.0.dar | head -1))
DAR5=($(daml damlc inspect ../lib/daml-finance-refdata-0.1.0.dar | head -1))
DAR6=($(daml damlc inspect ../lib/daml-finance-interface-asset-0.1.0.dar | head -1))
DAR7=($(daml damlc inspect ../lib/contingent-claims-3.0.0.20220708.1.dar | head -1))

echo ""
echo \"@daml.js/daml-finance-asset\": \"file:daml.js/${DAR1[1]}\",
echo \"@daml.js/daml-finance-settlement\": \"file:daml.js/${DAR2[1]}\",
echo \"@daml.js/daml-finance-lifecycle\": \"file:daml.js/${DAR3[1]}\",
echo \"@daml.js/daml-finance-derivative\": \"file:daml.js/${DAR4[1]}\",
echo \"@daml.js/daml-finance-refdata\": \"file:daml.js/${DAR5[1]}\",
echo \"@daml.js/daml-finance-interface-asset\": \"file:daml.js/${DAR6[1]}\",
echo \"@daml.js/contingent-claims\": \"file:daml.js/${DAR7[1]}\",
echo ""
