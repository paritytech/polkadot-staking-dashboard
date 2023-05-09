// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { VoidFn } from '@polkadot/api/types';
import {
  addedTo,
  clipAddress,
  localStorageOrDefault,
  matchedProperties,
  removedFrom,
  rmCommas,
  setStateWithRef,
} from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { isSupportedProxy } from 'config/proxies';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import React, { useEffect, useRef, useState } from 'react';
import type { AnyApi, MaybeAccount } from 'types';
import * as defaults from './defaults';
import type {
  Delegates,
  ProxiedAccounts,
  Proxies,
  ProxiesContextInterface,
  Proxy,
  ProxyDelegate,
} from './type';

export const ProxiesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { api, isReady, network } = useApi();
  const {
    accounts,
    activeProxy,
    setActiveProxy,
    activeAccount,
    addExternalAccount,
  } = useConnect();

  // store the proxy accounts of each imported account.
  const [proxies, setProxies] = useState<Proxies>([]);
  const proxiesRef = useRef(proxies);
  const unsubs = useRef<Record<string, VoidFn>>({});

  // Handle the syncing of accounts on accounts change.
  const handleSyncAccounts = () => {
    // Sync removed accounts.
    const handleRemovedAccounts = () => {
      const removed = removedFrom(accounts, proxiesRef.current, [
        'address',
      ]).map(({ address }) => address);

      removed?.forEach((address) => {
        const unsub = unsubs.current[address];
        if (unsub) unsub();
      });

      unsubs.current = Object.fromEntries(
        Object.entries(unsubs.current).filter(([key]) => !removed.includes(key))
      );
    };
    // Sync added accounts.
    const handleAddedAccounts = () => {
      addedTo(accounts, proxiesRef.current, ['address'])?.map(({ address }) =>
        subscribeToProxies(address)
      );
    };
    // Sync existing accounts.
    const handleExistingAccounts = () => {
      setStateWithRef(
        matchedProperties(accounts, proxiesRef.current, ['address']),
        setProxies,
        proxiesRef
      );
    };
    handleRemovedAccounts();
    handleAddedAccounts();
    handleExistingAccounts();
  };

  // store the delegates and the corresponding delegators
  const [delegates, setDelegates] = useState<Delegates>({});
  const delegatesRef = useRef(delegates);

  const subscribeToProxies = async (address: string) => {
    if (!api) return;

    const unsub = await api.queryMulti<AnyApi>(
      [[api.query.proxy.proxies, address]],
      async ([result]) => {
        const data = result.toHuman();
        const newProxies = data[0];
        const reserved = new BigNumber(rmCommas(data[1]));

        if (newProxies.length) {
          setStateWithRef(
            [...proxiesRef.current]
              .filter(({ delegator }) => delegator !== address)
              .concat({
                address,
                delegator: address,
                delegates: newProxies.map((d: AnyApi) => ({
                  delegate: d.delegate.toString(),
                  proxyType: d.proxyType.toString(),
                })),
                reserved,
              }),
            setProxies,
            proxiesRef
          );
        } else {
          // no proxies: remove stale proxies if already in list.
          setStateWithRef(
            [...proxiesRef.current].filter(
              ({ delegator }) => delegator !== address
            ),
            setProxies,
            proxiesRef
          );
        }
      }
    );

    unsubs.current[address] = unsub;
    return unsub;
  };

  // Gets the delegates of the given account
  const getDelegates = (address: MaybeAccount): Proxy | undefined => {
    return (
      proxiesRef.current.find(({ delegator }) => delegator === address) ||
      undefined
    );
  };

  // Gets delegators and proxy types for the given delegate address
  const getProxiedAccounts = (address: MaybeAccount) => {
    const delegate = delegatesRef.current[address || ''];
    if (!delegate) {
      return [];
    }
    const proxiedAccounts: ProxiedAccounts = delegate
      .filter(({ proxyType }) => isSupportedProxy(proxyType))
      .map(({ delegator, proxyType }) => ({
        address: delegator,
        name: clipAddress(delegator),
        proxyType,
      }));
    return proxiedAccounts;
  };

  // Gets the delegates and proxy type of an account, if any.
  const getProxyDelegate = (
    delegator: MaybeAccount,
    delegate: MaybeAccount
  ): ProxyDelegate | null =>
    proxiesRef.current
      .find((p) => p.delegator === delegator)
      ?.delegates.find((d) => d.delegate === delegate) ?? null;

  // Subscribe new accounts to proxies, and remove accounts that are no longer imported.
  useEffect(() => {
    if (isReady) {
      handleSyncAccounts();
    }
  }, [accounts, isReady, network]);

  // If active proxy has not yet been set, check local storage `activeProxy` & set it as active
  // proxy if it is the delegate of `activeAccount`.
  useEffect(() => {
    const localActiveProxy = localStorageOrDefault(
      `${network.name}_active_proxy`,
      null
    );

    if (!localActiveProxy) {
      setActiveProxy(null);
    } else if (
      proxiesRef.current.length &&
      localActiveProxy &&
      !activeProxy &&
      activeAccount
    ) {
      // Add `activePrroxy` as external account if not imported.
      if (!accounts.find(({ address }) => address === localActiveProxy)) {
        addExternalAccount(localActiveProxy, 'system');
      }

      const isActive = (
        proxiesRef.current.find(({ delegator }) => delegator === activeAccount)
          ?.delegates || []
      ).find(({ delegate }) => delegate === localActiveProxy);
      if (isActive) {
        setActiveProxy(localActiveProxy);
      }
    }
  }, [accounts, activeAccount, proxiesRef.current, network]);

  // Reset active proxy state, unsubscribe from subscriptions on network change & unmount.
  useEffect(() => {
    setActiveProxy(null, false);
    unsubAll();
    return () => unsubAll();
  }, [network]);

  const unsubAll = () => {
    for (const unsub of Object.values(unsubs.current)) {
      unsub();
    }
    unsubs.current = {};
  };

  // Listens to `proxies` state updates and reformats the data into a list of delegates.
  useEffect(() => {
    // Reformat proxiesRef.current into a list of delegates.
    const newDelegates: Delegates = {};
    for (const proxy of proxiesRef.current) {
      const { delegator } = proxy;

      // checking if delegator is not null to keep types happy.
      if (delegator) {
        // get each delegate of this proxy record.
        for (const { delegate, proxyType } of proxy.delegates) {
          const item = {
            delegator,
            proxyType,
          };
          // check if this delegate exists in `newDelegates`.
          if (Object.keys(newDelegates).includes(delegate)) {
            // append delegator to the existing delegate record if it exists.
            newDelegates[delegate].push(item);
          } else {
            // create a new delegate record if it does not yet exist in `newDelegates`.
            newDelegates[delegate] = [item];
          }
        }
      }
    }

    setStateWithRef(newDelegates, setDelegates, delegatesRef);
  }, [proxiesRef.current]);

  return (
    <ProxiesContext.Provider
      value={{
        proxies: proxiesRef.current,
        delegates: delegatesRef.current,
        getDelegates,
        getProxyDelegate,
        getProxiedAccounts,
      }}
    >
      {children}
    </ProxiesContext.Provider>
  );
};

export const ProxiesContext = React.createContext<ProxiesContextInterface>(
  defaults.defaultProxiesContext
);

export const useProxies = () => React.useContext(ProxiesContext);
