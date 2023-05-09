// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { rmCommas, setStateWithRef } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import type {
  PoolMembership,
  PoolMembershipsContextState,
} from 'contexts/Pools/types';
import React, { useEffect, useRef, useState } from 'react';
import type { AnyApi, Fn } from 'types';
import { useApi } from '../../Api';
import { useConnect } from '../../Connect';
import * as defaults from './defaults';

export const PoolMembershipsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { api, network, isReady } = useApi();
  const { accounts: connectAccounts, activeAccount } = useConnect();

  // stores pool membership
  const [poolMemberships, setPoolMemberships] = useState<PoolMembership[]>([]);
  const poolMembershipsRef = useRef(poolMemberships);

  // stores pool subscription objects
  const poolMembershipUnsubs = useRef<AnyApi[]>([]);

  useEffect(() => {
    if (isReady) {
      (() => {
        setStateWithRef([], setPoolMemberships, poolMembershipsRef);
        unsubscribeAll();
        getPoolMemberships();
      })();
    }
  }, [network, isReady, connectAccounts]);

  // subscribe to account pool memberships
  const getPoolMemberships = async () => {
    Promise.all(
      connectAccounts.map((a) => subscribeToPoolMembership(a.address))
    );
  };

  // unsubscribe from pool memberships on unmount
  useEffect(
    () => () => {
      unsubscribeAll();
    },
    []
  );

  // unsubscribe from all pool memberships
  const unsubscribeAll = () => {
    Object.values(poolMembershipUnsubs.current).forEach((v: Fn) => v());
  };

  // subscribe to an account's pool membership
  const subscribeToPoolMembership = async (address: string) => {
    if (!api) return;

    const unsub = await api.query.nominationPools.poolMembers(
      address,
      async (result: AnyApi) => {
        let membership = result?.unwrapOr(undefined)?.toHuman();

        if (membership) {
          // format pool's unlocking chunks
          const unbondingEras: AnyApi = membership.unbondingEras;
          const unlocking = [];
          for (const [e, v] of Object.entries(unbondingEras || {})) {
            const era = rmCommas(e as string);
            const value = rmCommas(v as string);
            unlocking.push({
              era: Number(era),
              value: new BigNumber(value),
            });
          }
          membership.points = membership.points
            ? rmCommas(membership.points)
            : '0';
          membership = {
            address,
            ...membership,
            unlocking,
          };

          // remove stale membership if it's already in list
          let _poolMemberships = Object.values(poolMembershipsRef.current);
          _poolMemberships = _poolMemberships
            .filter((m: PoolMembership) => m.address !== address)
            .concat(membership);

          setStateWithRef(
            _poolMemberships,
            setPoolMemberships,
            poolMembershipsRef
          );
        } else {
          // no membership: remove account membership if present
          let _poolMemberships = Object.values(poolMembershipsRef.current);
          _poolMemberships = _poolMemberships.filter(
            (m: PoolMembership) => m.address !== address
          );
          setStateWithRef(
            _poolMemberships,
            setPoolMemberships,
            poolMembershipsRef
          );
        }
      }
    );

    poolMembershipUnsubs.current = poolMembershipUnsubs.current.concat(unsub);
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

export const PoolMembershipsContext =
  React.createContext<PoolMembershipsContextState>(
    defaults.defaultPoolMembershipsContext
  );

export const usePoolMemberships = () =>
  React.useContext(PoolMembershipsContext);
