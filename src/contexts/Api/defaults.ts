// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { stringToU8a } from '@polkadot/util';
import {
  APIConstants,
  APIContextInterface,
  ConnectionStatus,
} from 'contexts/Api/types';
import BN from 'bn.js';
import { NETWORKS } from 'config/networks';

export const consts: APIConstants = {
  bondDuration: 0,
  maxNominations: 0,
  sessionsPerEra: 0,
  maxNominatorRewardedPerValidator: 0,
  maxElectingVoters: 0,
  expectedBlockTime: 0,
  existentialDeposit: new BN(0),
  poolsPalletId: stringToU8a('0'),
};

export const defaultApiContext: APIContextInterface = {
  // eslint-disable-next-line
  connect: async () => {
    await new Promise((resolve) => resolve(null));
  },
  fetchDotPrice: () => {},
  // eslint-disable-next-line
  switchNetwork: async (_network, _isLightClient) => {
    await new Promise((resolve) => resolve(null));
  },
  api: null,
  consts,
  isLightClient: false,
  isReady: false,
  status: ConnectionStatus.Disconnected,
  network: NETWORKS.polkadot,
};
