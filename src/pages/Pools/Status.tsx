// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PoolState } from 'contexts/Pools/types';
import BN from 'bn.js';
import { useUi } from 'contexts/UI';
import { Separator } from 'Wrappers';
import { CardWrapper } from 'library/Graphs/Wrappers';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { useModal } from 'contexts/Modal';
import { Stat } from 'library/Stat';
import { planckBnToUnit } from 'Utils';
import {
  faPaperPlane,
  faSignOutAlt,
  faTimesCircle,
  faLock,
  faUserPlus,
  faPlusCircle,
  faLockOpen,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import { usePoolsTabs } from './context';

export const Status = () => {
  const { network, isReady } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { units, unit } = network;
  const { isSyncing } = useUi();
  const { membership } = usePoolMemberships();
  const { setActiveTab } = usePoolsTabs();

  const {
    activeBondedPool,
    poolNominations,
    isOwner,
    getNominationsStatus,
    getPoolBondOptions,
  } = useActivePool();
  const { openModalWith } = useModal();
  const { active } = getPoolBondOptions(activeAccount);
  const nominationStatuses = getNominationsStatus();
  const activeNominations = Object.values(nominationStatuses).filter(
    (_v) => _v === 'active'
  ).length;
  const isNominating = !!poolNominations?.targets?.length;

  // Pool status `Stat` props
  const { label, buttons } = (() => {
    let _label;
    let _buttons;
    const createBtn = {
      title: 'Create Pool',
      icon: faPlusCircle,
      transform: 'grow-1',
      disabled: !isReady || isReadOnlyAccount(activeAccount) || !activeAccount,
      onClick: () => openModalWith('CreatePool', { bondType: 'pool' }, 'small'),
    };
    const joinPoolBtn = {
      title: 'Join Pool',
      icon: faUserPlus,
      transform: 'grow-1',
      disabled: !isReady || isReadOnlyAccount(activeAccount) || !activeAccount,
      onClick: () => setActiveTab(1),
    };
    const leaveBtn = {
      title: 'Leave Pool',
      icon: faSignOutAlt,
      disabled: !isReady || isReadOnlyAccount(activeAccount),
      small: true,
      onClick: () => openModalWith('LeavePool', { bondType: 'pool' }, 'small'),
    };
    const destroyBtn = {
      title: 'Destroy Pool',
      icon: faTimesCircle,
      transform: 'grow-1',
      disabled: !isReady || isReadOnlyAccount(activeAccount),
      small: true,
      onClick: () =>
        openModalWith(
          'ChangePoolState',
          { bondType: 'pool', state: PoolState.Destroy },
          'small'
        ),
    };
    const blockBtn = {
      title: 'Lock Pool',
      icon: faLock,
      transform: 'grow-1',
      disabled: !isReady || isReadOnlyAccount(activeAccount),
      small: true,
      onClick: () =>
        openModalWith(
          'ChangePoolState',
          { bondType: 'pool', state: PoolState.Block },
          'small'
        ),
    };
    const openBtn = {
      title: 'Unlock Pool',
      icon: faLockOpen,
      transform: 'grow-1',
      disabled: !isReady || isReadOnlyAccount(activeAccount),
      small: true,
      onClick: () =>
        openModalWith(
          'ChangePoolState',
          { bondType: 'pool', state: PoolState.Open },
          'small'
        ),
    };

    if (!membership) {
      _label = 'Not in a Pool';
      _buttons = [createBtn, joinPoolBtn];
    } else if (isOwner()) {
      _label = `Owner of Pool ${membership.poolId}`;
      switch (activeBondedPool?.state) {
        case PoolState.Open:
          _buttons = [destroyBtn, blockBtn];
          break;
        case PoolState.Block:
          _buttons = [destroyBtn, openBtn];
          break;
        default:
          _buttons = [];
      }
    } else if (active?.gtn(0)) {
      _label = `Active in Pool ${membership.poolId}`;
      _buttons = [leaveBtn];
    } else {
      _label = `Leaving Pool ${membership.poolId}`;
    }
    return { label: _label, buttons: _buttons };
  })();

  const labelMembership = label;

  // Unclaimed rewards `Stat` props
  let { unclaimedReward } = activeBondedPool || {};
  unclaimedReward = unclaimedReward ?? new BN(0);
  const labelRewards = `${planckBnToUnit(unclaimedReward, units)} ${unit}`;

  const buttonsRewards = unclaimedReward.gtn(0)
    ? [
        {
          title: 'Claim',
          icon: faPaperPlane,
          disabled: !isReady || isReadOnlyAccount(activeAccount),
          small: true,
          onClick: () =>
            openModalWith('ClaimReward', { bondType: 'pool' }, 'small'),
        },
      ]
    : undefined;

  // determine pool state icon
  const poolState = activeBondedPool?.state ?? null;

  let poolStateIcon;
  switch (poolState) {
    case PoolState.Block:
      poolStateIcon = faLock;
      break;
    case PoolState.Destroy:
      poolStateIcon = faExclamationTriangle;
      break;
    default:
      poolStateIcon = undefined;
  }

  // determine pool status - left side
  const poolStatusLeft =
    poolState === PoolState.Block
      ? 'Blocked / '
      : poolState === PoolState.Destroy
      ? 'Destroying / '
      : '';

  // determine pool status - right side
  const poolStatusRight = isSyncing
    ? 'Inactive: Not Nominating'
    : !isNominating
    ? 'Inactive: Not Nominating'
    : activeNominations
    ? 'Actively Nominating with Pool Funds'
    : 'Waiting for Active Nominations';

  return (
    <CardWrapper height="300">
      <Stat
        label="Membership"
        assistant={['pools', 'Pool Status']}
        stat={labelMembership}
        buttons={isSyncing ? [] : buttons}
      />
      <Separator />
      <Stat
        label="Unclaimed Rewards"
        assistant={['pools', 'Pool Rewards']}
        stat={labelRewards}
        buttons={isSyncing ? [] : buttonsRewards}
      />
      {membership && (
        <>
          <Separator />
          <Stat
            icon={isSyncing ? undefined : poolStateIcon}
            label="Pool Status"
            assistant={['stake', 'Staking Status']}
            stat={`${poolStatusLeft}${poolStatusRight}`}
          />
        </>
      )}
    </CardWrapper>
  );
};

export default Status;
