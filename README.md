[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/digital-asset/daml/blob/main/LICENSE)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digital-asset/daml-finance-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digital-asset/daml-finance-app/tree/main)

Copyright © 2023 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved. SPDX-License-Identifier: Apache-2.0

# Daml Finance Reference App

This Daml Finance Reference App showcases how the [Daml Finance](https://www.digitalasset.com/daml-finance) library can be integrated into a fully-fledged Daml application.

<img alt="Daml Finance Reference App homepage" src="./homepage.png" width="800">

## Money-market-fund branch

This demo shows how a money-market fund can interact with a collateral application.

### Parties 

#### Investors 

These include Hedge Funds, Swaps-dealers, Prime brokers, etc. Anybody who would want to own MMF tokens or wants to be able to send and receive margin calls via a DLT. 

#### Fund Manager 

This is the issuer of the MMF. They are responsible for the administration of the MMF. Most of this administration takes place off-ledger. The on-ledger responsibilities include updating the NAV of the fund, and to pay dividends. 

#### Transfer Agent (TA)

The TA is principally responsible for:
- Brokering the subscription and redemption process for their Investors
- Onboarding and off-boarding Cash
- Disbersing dividends to investors 
- Batching subscriptions and redemptions for the Fund Manager
- Onboarding Investors (e.g. KYC)

#### Cash Rail 

The system or party responsible for onboarding and off-boarding cash. Typically a wire system. 

#### Custodian 

The system or party responsible for maintaining Token definitions and global account balances. 

####  Collateral Clearer 

The system responsible for maintaining bilateral collateral agreements between Investors, and to intervene in case of default.

### Principal Workflows 

#### (MMF) Subscriptions 

This workflow allows investors to request a conversion of their already onboarded USD to MMF tokens at a 1:1 rate. 

1. *Investors* request MMF tokens
2. *TA* reviews and pools those requests
3. *Fund Manager* reviews pooled requests, 
  - Initiates subscriptions off-ledger. Once completed, 
  - Approves pooled requests on ledger.
  - ...atomically, USD is transferred to the *Fund Manager* from the *Investors*, and tokens are created for *Investors*. 

#### (MMF) Redemption 

This workflow allows an investor to cash out their MMF token and convert to on-ledger USD. 

(TODO)

#### (MMF) Dividend Drop 

This workflow allows the manager of a MMF to issue a dividend, to be paid in USD. 

1. *Fund Manager* declares a dividend, e.g. "$0.0245 per token". 
2. Any *Investor* which holds a token of the MMF can claim the dividend, to be paid out in USD. 
3. Claims are automatically converted to a settlement instruction to the *Investor*. 

## Documentation

The [Daml Finance documentation](https://docs.daml.com/daml-finance) provides a number of
options to get started using the library.

## Running

On Linux or MacOS, run the following commands:
```
./scripts/get-dependencies.sh
daml start
```
On Windows, run the following:
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

## Contributing

### Dependencies

This repo assumes the use of [direnv] for local development, along with a
working [Nix] installation.

[direnv]: https://github.com/direnv/direnv
[Nix]: https://nixos.org/download.html