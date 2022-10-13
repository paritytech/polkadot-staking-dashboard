// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { Number } from 'library/StatBoxList/Number';
import { useTranslation } from 'react-i18next';

const ActivePoolsStatBox = () => {
  const { stats } = usePoolsConfig();
  const { t } = useTranslation('common');

  const params = {
    label: t('pages.pools.active_pools'),
    value: stats.counterForBondedPools.toNumber(),
    unit: '',
    helpKey: 'Active Pools',
  };
  return <Number {...params} />;
};

export default ActivePoolsStatBox;
