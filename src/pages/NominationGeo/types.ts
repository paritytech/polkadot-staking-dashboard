// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominatorDetail, ChainMetadata } from '@polkawatch/ddp-client';
export type { NominatorDetail } from '@polkawatch/ddp-client';

export type { ChainMetadata } from '@polkawatch/ddp-client';

export interface AnalyzedPayoutsProps {
  data?: NominatorDetail;
}

export interface AnalyzedErasProps {
  meta?: ChainMetadata;
}

export interface NomninationGeoListProps {
  allowMoreCols: boolean;
  title: string;
  data?: NominatorDetail;
}

import type { ListFormat } from 'library/PoolList/types';
export interface NominationGeoListContextInterface {
  setListFormat: (v: ListFormat) => void;
  listFormat: ListFormat;
}
