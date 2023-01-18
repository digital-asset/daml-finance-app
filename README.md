[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digital-asset/daml-finance-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digital-asset/daml-finance-app/tree/main)

Copyright © 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

# Dependencies

This repo assumes the use of [direnv] for local development, along with a
working [Nix] installation.

[direnv]: https://github.com/direnv/direnv
[Nix]: https://nixos.org/download.html

# Building

To build all packages run:
```
make ci-local
```
The built packages are now located in the `.dars` directory.

# Running

We currently don't support running the app on Windows natively, but you can use Windows Subsystem for Linux (WSL) if available and follow the instructions below.

On Linux or MacOS run the following command:
```
DAML_PROJECT=package/main/daml/Daml.Finance.App.Setup/ daml start
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
