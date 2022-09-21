[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
<!-- [![CircleCI](https://circleci.com/gh/digital-asset/daml-finance-app.svg?style=shield)](https://circleci.com/gh/digital-asset/daml-finance-app) -->

Copyright © 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

# Prerequisites

- [Daml SDK](https://docs.daml.com/getting-started/installation.html)
- [NodeJS](https://nodejs.org/en/): install v16.x

# Running

If on Linux or MacOS, run the following commands:
```
./script/get-dependencies.sh
daml start
```
If on Windows, run the following:
```
./script/get-dependencies.sh
daml start
```

Wait until the sandbox is up and running, indicated by the following output:
```
...
Press 'r' to re-build and upload the package to the sandbox.
Press 'Ctrl-C' to quit.
```

Then, in another console run:
```
cd ui
npm install
npm start
```
