[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
<!-- [![CircleCI](https://circleci.com/gh/digital-asset/daml-finance-app.svg?style=shield)](https://circleci.com/gh/digital-asset/daml-finance-app) -->

Copyright © 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

# Prerequisites

- [yq](https://github.com/marketplace/actions/yq-portable-yaml-processor)

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

# Java Codegen

It is possible to generate java code from the Daml packages you need, by running
daml with the java codegen option, for example:

```
daml codegen java -o ./output daml-finance-interface-holding-0.1.7.dar daml-finance-interface-instrument-base-0.1.7.dar daml-finance-interface-instrument-generic-0.1.8.dar daml-finance-interface-lifecycle-0.1.8.dar daml-finance-interface-settlement-0.1.8.dar daml-finance-interface-types-0.1.6.dar daml-finance-interface-util-0.1.6.dar
```

Note, this only works on for packages from Daml Finance release v0.1.7 onwards (November 2022).
