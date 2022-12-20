// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MaybeAccount, MaybeString } from 'types';

export enum SetupType {
  Pool = 'pool',
  Stake = 'stake',
}

export interface StakeSetupProgress {
  controller: MaybeAccount;
  payee: MaybeAccount;
  nominations: Array<any>;
  bond: MaybeString;
  section: number;
}

export interface PoolCreateProgress {
  metadata: string;
  bond: string;
  nominations: Array<any>;
  roles: any;
  section: number;
}

export interface UIContextInterface {
  setSideMenu: (v: number) => void;
  setUserSideMenuMinimised: (v: number) => void;
  toggleService: (k: string) => void;
  getSetupProgress: (t: SetupType, a: MaybeAccount) => any;
  getStakeSetupProgressPercent: (a: MaybeAccount) => number;
  getPoolSetupProgressPercent: (a: MaybeAccount) => number;
  setActiveAccountSetup: (t: SetupType, p: any) => void;
  setActiveAccountSetupSection: (t: SetupType, s: number) => void;
  getServices: () => string[];
  setOnNominatorSetup: (v: number) => void;
  setOnPoolSetup: (v: number) => void;
  setContainerRefs: (v: any) => void;
  sideMenuOpen: number;
  userSideMenuMinimised: number;
  sideMenuMinimised: number;
  services: string[];
  onNominatorSetup: number;
  onPoolSetup: number;
  isSyncing: boolean;
  networkSyncing: boolean;
  poolsSyncing: boolean;
  containerRefs: any;
}
