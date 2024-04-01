// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNetwork } from 'contexts/Network';
import { HeadingWrapper } from '../Wrappers';
import type { BondedPool } from 'contexts/Pools/BondedPools/types';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { useApi } from 'contexts/Api';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

export const Stats = ({ bondedPool }: { bondedPool: BondedPool }) => {
  const {
    networkData: {
      units,
      unit,
      brand: { token: Token },
    },
  } = useNetwork();
  const { isReady, api } = useApi();

  // Store the pool balance.
  const [poolBalance, setPoolBalance] = useState<BigNumber | null>(null);

  // Fetches the balance of the bonded pool.
  const getPoolBalance = async () => {
    if (!api) {
      return;
    }

    const balance = (
      await api.call.nominationPoolsApi.pointsToBalance(
        bondedPool.id,
        rmCommas(bondedPool.points)
      )
    ).toString();

    if (balance) {
      setPoolBalance(new BigNumber(balance));
    }
  };

  // Fetch the balance when pool or points change.
  useEffect(() => {
    if (isReady) {
      getPoolBalance();
    }
  }, [bondedPool.id, bondedPool.points, isReady]);

  return (
    <HeadingWrapper>
      <h4>
        <span className="active">Actively Nominating</span>

        <span className="balance">
          <Token className="icon" />
          {!poolBalance
            ? `...`
            : planckToUnit(poolBalance, units).decimalPlaces(3).toFormat()}{' '}
          {unit} Bonded
        </span>
      </h4>
    </HeadingWrapper>
  );
};
