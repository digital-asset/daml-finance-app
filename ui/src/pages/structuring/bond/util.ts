// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SelectInputValue } from "../../../components/Form/SelectInput";

export const couponFrequencies : SelectInputValue[] = [
  { value: "Annual", display: "Annual" },
  { value: "Semi-annual", display: "Semi-annual" },
  { value: "Quarterly", display: "Quarterly" },
];

export const dayCountConventions : SelectInputValue[] = [
  { value: "Act360", display: "Act/360" },
  { value: "Act365Fixed", display: "Act/365 (Fixed)" },
  { value: "Act365L", display: "Act/365 (L)" },
  { value: "ActActAFB", display: "Act/Act (AFB)" },
  { value: "ActActISDA", display: "Act/Act (ISDA)" },
  { value: "ActActICMA", display: "Act/Act (ICMA)" },
  { value: "Basis1", display: "Basis 1/1" },
  { value: "Basis30360", display: "Basis 30/360" },
  { value: "Basis30360ICMA", display: "Basis 30/360 (ICMA)" },
  { value: "Basis30E360", display: "Basis 30E/360" },
  { value: "Basis30E3360", display: "Basis 30E3/360" },
];

export const businessDayConventions : SelectInputValue[] = [
  { value: "Following", display: "Following" },
  { value: "ModifiedFollowing", display: "Modified Following" },
  { value: "Preceding", display: "Preceding" },
  { value: "ModifiedPreceding", display: "Modified Preceding" },
  { value: "NoAdjustment", display: "None" },
];

export const holidayCalendars : SelectInputValue[] = [
  { value: "FED", display: "Fedwire Holidays" },
];

export const referenceRates : SelectInputValue[] = [
  { value: "USD/LIBOR/1M", display: "USD Libor 1M" },
  { value: "USD/LIBOR/3M", display: "USD Libor 3M" },
  { value: "USD/LIBOR/6M", display: "USD Libor 6M" },
  { value: "USD/LIBOR/12M", display: "USD Libor 12M" },
  { value: "EUR/EURIBOR/1M", display: "EUR Euribor 1M" },
  { value: "EUR/EURIBOR/3M", display: "EUR Euribor 3M" },
  { value: "EUR/EURIBOR/6M", display: "EUR Euribor 6M" },
  { value: "EUR/EURIBOR/12M", display: "EUR Euribor 12M" },
];

export const inflationIndices : SelectInputValue[] = [
  { value: "CPI", display: "Consumer Price Index" },
];

