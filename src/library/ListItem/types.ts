// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BondedPool } from 'contexts/Pools/types';
import React from 'react';
import { AnyMetaBatch, MaybeAccount } from 'types';

export interface BlockedProps {
  prefs: {
    commission: string;
    blocked: boolean;
  };
}

export interface CopyAddressProps {
  validator: {
    address: string;
  };
}

export interface FavoriteProps {
  address: string;
}

export interface IdentityProps {
  address: string;
  batchIndex: number;
  batchKey: string;
  meta: AnyMetaBatch;
}

export interface PoolIdentityProps {
  batchIndex: number;
  batchKey: string;
  pool: BondedPool;
}

export interface MetricsProps {
  display: React.ReactNode | null;
  address: string;
}

export interface NominationStatusProps {
  address: string;
  bondType: string;
  nominator: MaybeAccount;
}

export interface OversubscribedProps {
  batchIndex: number;
  batchKey: string;
}

export interface SelectProps {
  item: {
    address: string;
  };
}

export interface ParaValidatorProps {
  address: MaybeAccount;
}
