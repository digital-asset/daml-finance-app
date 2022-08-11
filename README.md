[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
<!-- [![CircleCI](https://circleci.com/gh/digital-asset/daml-finance-app.svg?style=shield)](https://circleci.com/gh/digital-asset/daml-finance-app) -->

Copyright © 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

# Running

Console 1:
```
make
daml start
```

Console 2:
```
cd ui
npm install
npm start
```

# Triggers

To compile the triggers, and after any Daml change in the main project, run:
```
cd triggers
daml clean
daml build
```

For settlement of auctions run:
```
daml trigger --wall-clock-time --dar .daml/dist/daml-finance-app-triggers-0.2.0.dar --trigger-name SettlementInstructionTrigger:handleSettlementInstruction --ledger-host localhost --ledger-port 6865 --ledger-party Agent
```

For matching orders on the exchange run:
```
daml trigger --wall-clock-time --dar .daml/dist/daml-finance-app-triggers-0.2.0.dar --trigger-name MatchingEngine:handleMatching --ledger-host localhost --ledger-port 6865 --ledger-party Exchange
```

For settling matched trades run:
```
daml trigger --wall-clock-time --dar .daml/dist/daml-finance-app-triggers-0.2.0.dar --trigger-name SettlementInstructionTrigger:handleSettlementInstruction --ledger-host localhost --ledger-port 6865 --ledger-party Exchange
```
