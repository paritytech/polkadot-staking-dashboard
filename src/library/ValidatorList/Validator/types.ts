// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MaybeAccount } from 'types';

export interface NominationProps {
  validator: any;
  nominator: MaybeAccount;
  toggleFavorites: boolean;
  batchIndex: number;
  batchKey: string;
  bondType: string;
  inModal: boolean;
}

export interface DefaultProps {
  validator: any;
  toggleFavorites: boolean;
  batchIndex: number;
  batchKey: string;
  showMenu: boolean;
  inModal: boolean;
}
