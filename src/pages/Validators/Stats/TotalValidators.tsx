// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useStaking } from 'contexts/Staking';
import { Pie } from 'library/StatBoxList/Pie';
import { useTranslation } from 'react-i18next';
import { toFixedIfNecessary } from 'Utils';

const TotalValidatorsStatBox = () => {
  const { staking } = useStaking();
  const { totalValidators, maxValidatorsCount } = staking;
  const { t } = useTranslation('pages');

  // total validators as percent
  let totalValidatorsAsPercent = 0;
  if (maxValidatorsCount.gt(new BN(0))) {
    totalValidatorsAsPercent = totalValidators
      .div(maxValidatorsCount.div(new BN(100)))
      .toNumber();
  }

  const params = {
    label: t('validators.totalValidators'),
    stat: {
      value: totalValidators.toNumber(),
      total: maxValidatorsCount.toNumber(),
      unit: '',
    },
    graph: {
      value1: totalValidators.toNumber(),
      value2: maxValidatorsCount.sub(totalValidators).toNumber(),
    },
    tooltip: `${toFixedIfNecessary(totalValidatorsAsPercent, 2)}%`,
    helpKey: 'Validator',
  };
  return <Pie {...params} />;
};

export default TotalValidatorsStatBox;
