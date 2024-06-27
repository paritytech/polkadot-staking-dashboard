// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItems } from 'contexts/Help/types';

export const HelpConfig: HelpItems = [
  {
    key: 'vault',
    definitions: ['Polkadot Vault'],
  },
  {
    key: 'overview',
    definitions: [
      'Total Nominators',
      'Active Nominators',
      'Your Balance',
      'Reserve Balance',
      'Locked Balance',
      'Average Reward Rate',
      'Inflation',
      'Ideal Staked',
      'Supply Staked',
      'Read Only Accounts',
      'Proxy Accounts',
      'Reserve Balance For Existential Deposit',
    ],
    external: [
      [
        'connectAccounts',
        'https://support.polkadot.network/support/solutions/articles/65000182121-how-to-use-the-staking-dashboard-connecting-your-account',
        'polkadot.network',
      ],
      [
        'howToUse',
        'https://support.polkadot.network/support/solutions/articles/65000182104-how-to-use-the-staking-dashboard-overview',
        'polkadot.network',
      ],
      [
        'stakeDot',
        'https://support.polkadot.network/support/solutions/articles/65000182104-how-to-use-the-staking-dashboard-overview',
        'polkadot.network',
      ],
    ],
  },
  {
    key: 'nominate',
    definitions: [
      'Nomination Status',
      'Bonding',
      'Active Stake Threshold',
      'Payout Destination',
      'Nominating',
      'Nominations',
      'Inactive Nominations',
    ],
    external: [
      [
        'changeDestination',
        'https://support.polkadot.network/support/solutions/articles/65000182220-how-to-use-the-staking-dashboard-changing-reward-destination',
        'polkadot.network',
      ],
      [
        'bondMore',
        'https://support.polkadot.network/support/solutions/articles/65000182207-how-to-use-the-staking-dashboard-bond-more-tokens-to-your-existing-stake',
        'polkadot.network',
      ],
      [
        'unbondingTokens',
        'https://support.polkadot.network/support/solutions/articles/65000182201-how-to-use-the-staking-dashboard-unbonding-your-tokens',
        'polkadot.network',
      ],
      [
        'rebonding',
        'https://support.polkadot.network/support/solutions/articles/65000182221-how-to-use-the-staking-dashboard-rebonding',
        'polkadot.network',
      ],
      [
        'changeAccount',
        'https://support.polkadot.network/support/solutions/articles/65000182218-how-to-use-the-staking-dashboard-changing-your-controller-account',
        'polkadot.network',
      ],
      [
        'changeNominations',
        'https://support.polkadot.network/support/solutions/articles/65000182518-how-to-use-the-staking-dashboard-changing-your-nominations',
        'polkadot.network',
      ],
    ],
  },
  {
    key: 'pools',
    definitions: [
      'Nomination Pools',
      'Active Pools',
      'Minimum To Join Pool',
      'Minimum To Create Pool',
      'Pool Membership',
      'Bonded in Pool',
      'Pool Rewards',
      'Pool Roles',
      'Pool Commission Rate',
      'Pool Max Commission',
      'Pool Commission Change Rate',
    ],
    external: [
      [
        'createPools',
        'https://support.polkadot.network/support/solutions/articles/65000182388-how-to-use-the-staking-dashboard-creating-nomination-pools',
        'polkadot.network',
      ],
      [
        'claimRewards',
        'https://support.polkadot.network/support/solutions/articles/65000182399-how-to-use-staking-dashboard-claiming-nomination-pool-rewards',
        'polkadot.network',
      ],
    ],
  },
  {
    key: 'decentralization',
    definitions: [
      'Decentralization Analytics Period',
      'Geolocation of Each Nomination',
      'Nomination Payout Distribution',
      'Total Payouts Analysed',
    ],
    external: [
      [
        'polkawatchAnalytics',
        'https://blog.polkawatch.app/introducing-polkawatch/',
        'polkawatch.app',
      ],
    ],
  },
  {
    key: 'validators',
    definitions: [
      'Validator',
      'Active Validator',
      'Average Commission',
      'Era',
      'Epoch',
      'Era Points',
      'Self Stake',
      'Nominator Stake',
      'Commission',
      'Blocked Nominations',
      'Rewards By Country And Network',
    ],
    external: [
      [
        'chooseValidators',
        'https://support.polkadot.network/support/solutions/articles/65000150130-how-do-i-know-which-validators-to-choose-',
        'polkadot.network',
      ],
    ],
  },
  {
    key: 'payouts',
    definitions: ['Payout', 'Last Era Payout', 'Payout History'],
    external: [],
  },
  {
    key: 'community',
    definitions: [],
    external: [],
  },
  {
    key: 'ledger',
    definitions: [
      'Ledger Hardware Wallets',
      'Ledger Rejected Transaction',
      'Ledger Request Timeout',
      'Open App On Ledger',
      'Ledger App Not on Latest Runtime Version',
      'Wrong Transaction',
    ],
    external: [],
  },
];
