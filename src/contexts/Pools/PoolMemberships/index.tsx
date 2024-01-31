// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { rmCommas, setStateWithRef } from '@polkadot-cloud/utils';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { PoolMembership, PoolMembershipsContextState } from './types';
import type { AnyApi, Fn } from 'types';
import { useEffectIgnoreInitial } from '@polkadot-cloud/react/hooks';
import { useNetwork } from 'contexts/Network';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import { useImportedAccounts } from 'contexts/Connect/ImportedAccounts';
import { useApi } from '../../Api';
import * as defaults from './defaults';

export const PoolMembershipsContext =
  createContext<PoolMembershipsContextState>(
    defaults.defaultPoolMembershipsContext
  );

export const usePoolMemberships = () => useContext(PoolMembershipsContext);

export const PoolMembershipsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { network } = useNetwork();
  const { api, isReady } = useApi();
  const { accounts } = useImportedAccounts();
  const { activeAccount } = useActiveAccounts();

  // Stores pool memberships for the imported accounts.
  const [poolMemberships, setPoolMemberships] = useState<PoolMembership[]>([]);
  const poolMembershipsRef = useRef(poolMemberships);

  // Stores pool membership unsubs.
  const unsubs = useRef<AnyApi[]>([]);

  // subscribe to account pool memberships
  const getPoolMemberships = async () => {
    Promise.all(
      accounts.map(({ address }) => subscribeToPoolMembership(address))
    );
  };

  // unsubscribe from all pool memberships
  const unsubAll = () => {
    Object.values(unsubs.current).forEach((v: Fn) => v());
  };

  // subscribe to an account's pool membership
  const subscribeToPoolMembership = async (address: string) => {
    if (!api) {
      return undefined;
    }

    const unsub = await api.queryMulti<AnyApi>(
      [
        [api.query.nominationPools.poolMembers, address],
        [api.query.nominationPools.claimPermissions, address],
      ],
      ([poolMember, claimPermission]) => {
        handleMembership(poolMember, claimPermission);
      }
    );

    const handleMembership = async (
      poolMember: AnyApi,
      claimPermission?: AnyApi
    ) => {
      let membership = poolMember?.unwrapOr(undefined)?.toHuman();

      if (membership) {
        // format pool's unlocking chunks
        const unbondingEras: AnyApi = membership.unbondingEras;

        const unlocking = [];
        for (const [e, v] of Object.entries(unbondingEras || {})) {
          unlocking.push({
            era: Number(rmCommas(e as string)),
            value: new BigNumber(rmCommas(v as string)),
          });
        }
        membership.points = membership.points
          ? rmCommas(membership.points)
          : '0';

        const balance =
          (
            await api.call.nominationPoolsApi.pointsToBalance(
              membership.poolId,
              membership.points
            )
          )?.toString() || '0';

        membership = {
          ...membership,
          balance: new BigNumber(balance),
          address,
          unlocking,
          claimPermission: claimPermission?.toString() || 'Permissioned',
        };

        // remove stale membership if it's already in list, and add to memberships.
        setStateWithRef(
          Object.values(poolMembershipsRef.current)
            .filter((m) => m.address !== address)
            .concat(membership),
          setPoolMemberships,
          poolMembershipsRef
        );
      } else {
        // no membership: remove account membership if present.
        setStateWithRef(
          Object.values(poolMembershipsRef.current).filter(
            (m) => m.address !== address
          ),
          setPoolMemberships,
          poolMembershipsRef
        );
      }
    };

    unsubs.current = unsubs.current.concat(unsub);
    return unsub;
  };

  // gets the membership of the active account
  const getActiveAccountPoolMembership = () => {
    if (!activeAccount) {
      return defaults.poolMembership;
    }
    const poolMembership = poolMembershipsRef.current.find(
      (m) => m.address === activeAccount
    );
    if (poolMembership === undefined) {
      return defaults.poolMembership;
    }
    return poolMembership;
  };

  // Reset and re-sync pool memberships on network change.
  // re-sync pool memberships when accounts update.
  useEffectIgnoreInitial(() => {
    if (isReady) {
      (() => {
        // NOTE: resetting memberships here.
        setStateWithRef([], setPoolMemberships, poolMembershipsRef);
        unsubAll();
        getPoolMemberships();
      })();
    }
  }, [network, isReady]);

  // re-sync pool memberships when accounts update.
  useEffectIgnoreInitial(() => {
    if (isReady) {
      (() => {
        unsubAll();
        getPoolMemberships();
      })();
    }
  }, [isReady, accounts]);

  // Unsubscribe from pool memberships on unmount.
  useEffect(
    () => () => {
      unsubAll();
    },
    []
  );

  return (
    <PoolMembershipsContext.Provider
      value={{
        membership: getActiveAccountPoolMembership(),
        memberships: poolMembershipsRef.current,
      }}
    >
      {children}
    </PoolMembershipsContext.Provider>
  );
};
