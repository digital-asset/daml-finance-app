[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digital-asset/daml-finance-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digital-asset/daml-finance-app/tree/main)

Copyright © 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

### Dependencies

This repo assumes the use of [direnv] for local development, along with a
working [Nix] installation.

[direnv]: https://github.com/direnv/direnv
[Nix]: https://nixos.org/download.html

# Running

If on Linux or MacOS, run the following commands:
```
./scripts/get-dependencies.sh
daml start
```
If on Windows, run the following:
```
./scripts/get-dependencies.bat
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

# Codegen

It is possible to generate *JavaScript* code from the Daml packages you need, by running
daml with the `js` codegen option, for example:

```
daml codegen js -o ./output daml-finance-interface-holding-0.1.7.dar daml-finance-interface-instrument-base-0.1.7.dar daml-finance-interface-instrument-generic-0.1.8.dar daml-finance-interface-lifecycle-0.1.8.dar daml-finance-interface-settlement-0.1.8.dar daml-finance-interface-types-0.1.6.dar daml-finance-interface-util-0.1.6.dar
```

Alternatively, if your app uses *Java*, you can also run the `java` codegen in a similar way:

```
daml codegen java -o ./output daml-finance-interface-holding-0.1.7.dar daml-finance-interface-instrument-base-0.1.7.dar daml-finance-interface-instrument-generic-0.1.8.dar daml-finance-interface-lifecycle-0.1.8.dar daml-finance-interface-settlement-0.1.8.dar daml-finance-interface-types-0.1.6.dar daml-finance-interface-util-0.1.6.dar
```

Note, this Daml Finance codegen is only supported on SDK versions 2.5.x and higher.
