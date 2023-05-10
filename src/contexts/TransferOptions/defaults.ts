// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import type { TransferOptions, TransferOptionsContextInterface } from './types';

export const defaultBondedContext: TransferOptionsContextInterface = {
  // eslint-disable-next-line
  getTransferOptions: (a) => transferOptions,
};

export const transferOptions: TransferOptions = {
  freeBalance: new BigNumber(0),
  forceReserved: new BigNumber(0),
  nominate: {
    active: new BigNumber(0),
    totalUnlocking: new BigNumber(0),
    totalUnlocked: new BigNumber(0),
    totalPossibleBond: new BigNumber(0),
    totalAdditionalBond: new BigNumber(0),
    totalUnlockChuncks: 0,
  },
  pool: {
    active: new BigNumber(0),
    totalUnlocking: new BigNumber(0),
    totalUnlocked: new BigNumber(0),
    totalPossibleBond: new BigNumber(0),
    totalAdditionalBond: new BigNumber(0),
    totalUnlockChuncks: 0,
  },
};
