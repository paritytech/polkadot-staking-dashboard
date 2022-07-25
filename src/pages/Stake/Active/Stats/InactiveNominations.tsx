// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useStaking } from 'contexts/Staking';
import { Pie } from 'library/StatBoxList/Pie';

export const ActiveNominationsStatBox = () => {
  const { getNominationsStatus, isNominating } = useStaking();
  const nominationStatuses = getNominationsStatus();

  const total = Object.values(nominationStatuses).length;
  const inactive =
    Object.values(nominationStatuses).filter((_v) => _v === 'inactive')
      .length ?? 0;

  // inactive nominations as percent
  let inactiveAsPercent = 0;
  if (total > 0) {
    inactiveAsPercent = inactive / (total * 0.01);
  }

  const params = {
    label: 'Inactive Nominations',
    stat: {
      value: inactive,
      total,
      unit: '',
    },
    graph: {
      value1: inactive,
      value2: total - inactive,
    },
    tooltip: isNominating() ? `${inactiveAsPercent}%` : undefined,
    assistant: {
      page: 'stake',
      key: 'Inactive Nominations',
    },
  };

  return <Pie {...params} />;
};

export default ActiveNominationsStatBox;
