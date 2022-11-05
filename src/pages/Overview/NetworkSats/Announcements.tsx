// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBullhorn as faBack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BN from 'bn.js';
import { useApi } from 'contexts/Api';
import { useNetworkMetrics } from 'contexts/Network';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { usePoolMembers } from 'contexts/Pools/PoolMembers';
import { BondedPool } from 'contexts/Pools/types';
import { useStaking } from 'contexts/Staking';
import { useUi } from 'contexts/UI';
import { motion } from 'framer-motion';
import { Announcement as AnnouncementLoader } from 'library/Loaders/Announcement';
import {
  humanNumber,
  planckBnToUnit,
  rmCommas,
  toFixedIfNecessary,
} from 'Utils';
import { Item } from './Wrappers';

export const Announcements = () => {
  const { networkSyncing, poolsSyncing, isSyncing } = useUi();
  const { network } = useApi();
  const { units } = network;
  const { staking } = useStaking();
  const { metrics } = useNetworkMetrics();
  const { poolMembers } = usePoolMembers();

  const {
    minNominatorBond,
    totalNominators,
    maxNominatorsCount,
    lastTotalStake,
  } = staking;
  const { bondedPools } = useBondedPools();
  const { totalIssuance } = metrics;

  let totalPoolPoints = new BN(0);
  bondedPools.forEach((b: BondedPool) => {
    totalPoolPoints = totalPoolPoints.add(new BN(rmCommas(b.points)));
  });
  const totalPoolPointsBase = humanNumber(
    toFixedIfNecessary(planckBnToUnit(totalPoolPoints, units), 0)
  );

  // total supply as percent
  let supplyAsPercent = 0;
  if (totalIssuance.gt(new BN(0))) {
    supplyAsPercent = lastTotalStake
      .div(totalIssuance.div(new BN(100)))
      .toNumber();
  }
  const lastTotalStakeBase = lastTotalStake.div(new BN(10 ** units));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const listItem = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
    },
  };

  const nominatorCapReached = maxNominatorsCount.eq(totalNominators);

  let nominatorReachedPercentage = new BN(0);
  if (maxNominatorsCount.gt(new BN(0)) && totalNominators.gt(new BN(0))) {
    nominatorReachedPercentage = totalNominators.div(
      maxNominatorsCount.div(new BN(100))
    );
  }

  const minNominatorBondBase = planckBnToUnit(minNominatorBond, units);

  const announcements = [];

  // maximum nominators have been reached
  if (nominatorCapReached && !isSyncing) {
    announcements.push({
      class: 'danger',
      title: 'Nominator Limit Has Been Reached.',
      subtitle:
        'The maximum allowed nominators have been reached on the network. Please wait for available slots if you wish to nominate.',
    });
  }

  // 90% plus nominators reached - warning
  if (nominatorReachedPercentage.toNumber() >= 90) {
    announcements.push({
      class: 'warning',
      title: `${toFixedIfNecessary(
        nominatorReachedPercentage.toNumber(),
        2
      )}% of Nominator Limit Reached.`,
      subtitle: `The maximum amount of nominators has almost been reached. The nominator cap is currently ${humanNumber(
        maxNominatorsCount.toNumber()
      )}.`,
    });
  }

  // bonded pools available
  if (bondedPools.length) {
    // total pools active
    announcements.push({
      class: 'pools',
      title: `${bondedPools.length} nomination pools are active.`,
      subtitle: `The number of nomination pools available to join on ${network.name}.`,
    });

    // total locked in pols
    announcements.push({
      class: 'pools',
      title: `${totalPoolPointsBase} ${network.unit} is currently bonded in pools.`,
      subtitle: `The total ${network.unit} currently bonded in nomination pools.`,
    });

    if (poolMembers.length > 0 && !poolsSyncing) {
      // total locked in pols
      announcements.push({
        class: 'pools',
        title: `${humanNumber(
          poolMembers.length
        )} pool members are actively bonding in pools.`,
        subtitle: `The total number of accounts that have joined a pool.`,
      });
    }
  }

  // minimum nominator bond
  announcements.push({
    class: 'neutral',
    title: `The minimum nominator bond is now ${minNominatorBondBase} ${network.unit}.`,
    subtitle: `The minimum bonding amount to start nominating on ${
      network.name
    } is now ${planckBnToUnit(minNominatorBond, units)} ${network.unit}.`,
  });

  // supply staked
  announcements.push({
    class: 'neutral',
    title: `${supplyAsPercent}% of total ${network.unit} supply is currently staked.`,
    subtitle: `A total of ${humanNumber(lastTotalStakeBase.toNumber())} ${
      network.unit
    } is actively staking on the network.`,
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ width: '100%' }}
    >
      {networkSyncing ? (
        <AnnouncementLoader />
      ) : (
        announcements.map((item, index) => (
          <Item key={`announcement_${index}`} variants={listItem}>
            <h4 className={item.class}>
              <FontAwesomeIcon
                icon={faBack}
                style={{ marginRight: '0.6rem' }}
              />
              {item.title}
            </h4>
            <p>{item.subtitle}</p>
          </Item>
        ))
      )}
    </motion.div>
  );
};
