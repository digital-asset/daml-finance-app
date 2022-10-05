// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
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
