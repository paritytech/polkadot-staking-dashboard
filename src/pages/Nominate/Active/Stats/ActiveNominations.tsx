// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useStaking } from 'contexts/Staking';
import { Pie } from 'library/StatBoxList/Pie';
import { useTranslation } from 'react-i18next';

export const ActiveNominationsStatBox = () => {
  const { getNominationsStatus } = useStaking();
  const nominationStatuses = getNominationsStatus();
  const { t } = useTranslation('pages');

  const total = Object.values(nominationStatuses).length;
  const active =
    Object.values(nominationStatuses).filter((_v) => _v === 'active').length ??
    0;

  const params = {
    label: t('nominate.active_nominations'),
    stat: {
      value: active,
      total,
      unit: '',
    },
    graph: {
      value1: active,
      value2: active ? 0 : 1,
    },
    tooltip: active ? 'Active' : undefined,
    helpKey: 'Nominations',
  };

  return <Pie {...params} />;
};

export default ActiveNominationsStatBox;
