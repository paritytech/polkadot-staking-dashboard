// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Number } from 'library/StatBoxList/Number';
import { useNetwork } from 'contexts/Network';
import { useTranslation } from 'react-i18next';

import type { AnalyzedPayoutsProps } from '../types';

// We simply report the size of payouts that have been analyzed for decentralization purpose

export const AnalyzedPayouts = ({ data }: AnalyzedPayoutsProps) => {
  const { t } = useTranslation('pages');
  const { unit } = useNetwork().networkData;

  const params = {
    label: t('decentralization.totalPayoutsAnalysed'),
    value:
      data?.nodeDistributionDetail?.reduce(
        (acc, node) => acc + node.TokenRewards,
        0
      ) || 0,
    decimals: 1,
    unit,
    helpKey: 'Total Payouts Analysed',
  };
  return <Number {...params} />;
};
