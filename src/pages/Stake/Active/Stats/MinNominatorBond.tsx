// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Number } from 'library/StatBoxList/Number';
import { useApi } from 'contexts/Api';
import { planckBnToUnit } from 'Utils';
import { useStaking } from 'contexts/Staking';

const MinNominatorBondBox = () => {
  const { network } = useApi();
  const { units } = network;
  const { staking } = useStaking();

  const param = {
    label: 'Minimum Nominator Bond',
    value: planckBnToUnit(staking.minNominatorBond, units),
    unit: network.unit,
    assistant: {
      page: 'stake',
      key: 'Minimum Nominator Bond',
    },
  };
  return <Number {...param} />;
};

export default MinNominatorBondBox;
