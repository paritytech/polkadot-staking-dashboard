// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import { EstimatedFeeContext } from './types';

export const defaultTxFees: EstimatedFeeContext = {
  txFees: new BigNumber(0),
  notEnoughFunds: false,
  // eslint-disable-next-line
  setTxFees: (f) => {},
  resetTxFees: () => {},
  // eslint-disable-next-line
  setSender: (s) => {},
  txFeesValid: false,
};
