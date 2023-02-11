// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import { SideMenuStickyThreshold } from 'consts';
import { ImportedAccount } from 'contexts/Connect/types';
import { useActivePools } from 'contexts/Pools/ActivePools';
import React, { useEffect, useRef, useState } from 'react';
import { localStorageOrDefault, setStateWithRef } from 'Utils';
import { useApi } from '../Api';
import { useBalances } from '../Balances';
import { useConnect } from '../Connect';
import { useNetworkMetrics } from '../Network';
import { useStaking } from '../Staking';
import * as defaults from './defaults';
import { SyncStart, UIContextInterface } from './types';

export const UIContext = React.createContext<UIContextInterface>(
  defaults.defaultUIContext
);

export const useUi = () => React.useContext(UIContext);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useApi();
  const { accounts: connectAccounts } = useConnect();
  const { staking, eraStakers } = useStaking();
  const { activeEra, metrics } = useNetworkMetrics();
  const { accounts } = useBalances();
  const { synced: activePoolsSynced } = useActivePools();

  // set whether the network has been synced.
  const [networkSyncing, setNetworkSyncing] = useState(false);

  // set whether pools are being synced.
  const [poolsSyncing, setPoolsSyncing] = useState(false);

  // set whether app is syncing.ncludes workers (active nominations).
  const [isSyncing, setIsSyncing] = useState(false);

  // store sync start times.
  const [syncStarts, setSyncStarts] = useState<Array<SyncStart>>([]);

  // gets the id of a sync
  const getSyncById = (id: string) => {
    const existing = syncStarts.find((s: SyncStart) => s.id === id);
    return existing?.start || null;
  };

  // get a sync start for an id
  const getSyncStart = (id: string) => {
    const existing = syncStarts.find((s: SyncStart) => s.id === id);
    return existing?.start || 0;
  };

  // set a sync start time for an id.
  const setSyncStart = (id: string, start: number | null) => {
    setSyncStarts([
      {
        id,
        start,
        synced: false,
      },
    ]);
  };

  // get whether a syncStart has been synced. Fall back to true if not existing.
  const getSyncSynced = (id: string) => {
    const existing = [...syncStarts].find((s: SyncStart) => s.id === id);
    return existing?.synced || false;
  };

  // set whether a syncStart has been synced.
  const setSyncSynced = (id: string) => {
    const existing = [...syncStarts].find((s: SyncStart) => s.id === id);
    if (existing) {
      setSyncStarts(
        [...syncStarts]
          .filter((s: SyncStart) => s.id !== id)
          .concat({
            ...existing,
            synced: true,
          })
      );
    }
  };

  // get side menu minimised state from local storage, default to not
  const _userSideMenuMinimised = Number(
    localStorageOrDefault('side_menu_minimised', 0)
  );

  // side menu control
  const [sideMenuOpen, setSideMenuOpen] = useState(0);

  // side menu minimised
  const [userSideMenuMinimised, _setUserSideMenuMinimised] = useState(
    _userSideMenuMinimised
  );
  const userSideMenuMinimisedRef = useRef(userSideMenuMinimised);
  const setUserSideMenuMinimised = (v: number) => {
    localStorage.setItem('side_menu_minimised', String(v));
    setStateWithRef(v, _setUserSideMenuMinimised, userSideMenuMinimisedRef);
  };

  // automatic side menu minimised
  const [sideMenuMinimised, setSideMenuMinimised] = useState(
    window.innerWidth <= SideMenuStickyThreshold
      ? 1
      : userSideMenuMinimisedRef.current
  );

  // resize side menu callback
  const resizeCallback = () => {
    if (window.innerWidth <= SideMenuStickyThreshold) {
      setSideMenuMinimised(0);
    } else {
      setSideMenuMinimised(userSideMenuMinimisedRef.current);
    }
  };

  // resize event listener
  useEffect(() => {
    window.addEventListener('resize', resizeCallback);
    return () => {
      window.removeEventListener('resize', resizeCallback);
    };
  }, []);

  // re-configure minimised on user change
  useEffect(() => {
    resizeCallback();
  }, [userSideMenuMinimised]);

  // app syncing updates
  useEffect(() => {
    let _syncing = false;
    let _networkSyncing = false;
    let _poolsSyncing = false;

    if (!isReady) {
      _syncing = true;
      _networkSyncing = true;
      _poolsSyncing = true;
    }
    // staking metrics have synced
    if (staking.lastReward === new BigNumber(0)) {
      _syncing = true;
      _networkSyncing = true;
      _poolsSyncing = true;
    }

    // era has synced from Network
    if (activeEra.index === 0) {
      _syncing = true;
      _networkSyncing = true;
      _poolsSyncing = true;
    }

    // all extension accounts have been synced
    const extensionAccounts = connectAccounts.filter(
      (a: ImportedAccount) => a.source !== 'external'
    );
    if (accounts.length < extensionAccounts.length) {
      _syncing = true;
      _networkSyncing = true;
      _poolsSyncing = true;
    }

    setNetworkSyncing(_networkSyncing);

    // active pools have been synced
    if (activePoolsSynced !== 'synced') {
      _syncing = true;
      _poolsSyncing = true;
    }

    setPoolsSyncing(_poolsSyncing);

    // eraStakers total active nominators has synced
    if (!eraStakers.totalActiveNominators) {
      _syncing = true;
    }

    setIsSyncing(_syncing);
  }, [isReady, staking, metrics, accounts, eraStakers, activePoolsSynced]);

  const setSideMenu = (v: number) => {
    setSideMenuOpen(v);
  };

  const [containerRefs, _setContainerRefs] = useState({});
  const setContainerRefs = (v: any) => {
    _setContainerRefs(v);
  };

  return (
    <UIContext.Provider
      value={{
        setSideMenu,
        setUserSideMenuMinimised,
        getSyncById,
        getSyncStart,
        setSyncStart,
        getSyncSynced,
        setSyncSynced,
        setContainerRefs,
        sideMenuOpen,
        userSideMenuMinimised: userSideMenuMinimisedRef.current,
        sideMenuMinimised,
        isSyncing,
        networkSyncing,
        poolsSyncing,
        containerRefs,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
