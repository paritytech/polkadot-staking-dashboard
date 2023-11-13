// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  useEffectIgnoreInitial,
  useExtensions,
  useExtensionAccounts,
} from '@polkadot-cloud/react/hooks';
import {
  getLocalLedgerAccounts,
  getLocalVaultAccounts,
} from 'contexts/Hardware/Utils';
import type { AnyFunction, MaybeAddress, NetworkName } from 'types';
import { ellipsisFn, setStateWithRef } from '@polkadot-cloud/utils';
import { useNetwork } from 'contexts/Network';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import Keyring from '@polkadot/keyring';
import type {
  ExternalAccount,
  ImportedAccount,
} from '@polkadot-cloud/react/types';
import {
  getActiveAccountLocal,
  getLocalExternalAccounts,
  removeLocalExternalAccounts,
} from '../Utils';
import type { OtherAccountsContextInterface } from './types';
import { defaultOtherAccountsContext } from './defaults';

export const OtherAccountsContext =
  createContext<OtherAccountsContextInterface>(defaultOtherAccountsContext);

export const OtherAccountsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    network,
    networkData: { ss58 },
  } = useNetwork();
  const { checkingInjectedWeb3 } = useExtensions();
  const { extensionAccountsSynced } = useExtensionAccounts();
  const { activeAccount, setActiveAccount } = useActiveAccounts();

  // Store whether other (non-extension) accounts have been initialised.
  const [otherAccountsSynced, setOtherAccountsSynced] =
    useState<boolean>(false);

  // Store other (non-extension) accounts list.
  const [otherAccounts, setOtherAccounts] = useState<ImportedAccount[]>([]);
  const otherAccountsRef = useRef(otherAccounts);

  // Store unsubscribe handlers for connected extensions.
  const unsubs = useRef<Record<string, AnyFunction>>({});

  // Store whether all accounts have been synced.
  const [accountsInitialised, setAccountsInitialised] =
    useState<boolean>(false);

  // Handle forgetting of an imported other account.
  const forgetOtherAccounts = (forget: ImportedAccount[]) => {
    // Unsubscribe and remove unsub from context ref.
    if (forget.length) {
      for (const { address } of forget) {
        if (otherAccountsRef.current.find((a) => a.address === address)) {
          const unsub = unsubs.current[address];
          if (unsub) {
            unsub();
            delete unsubs.current[address];
          }
        }
      }
      // Remove forgotten accounts from context state.
      setStateWithRef(
        [...otherAccountsRef.current].filter(
          (a) =>
            forget.find(({ address }) => address === a.address) === undefined
        ),
        setOtherAccounts,
        otherAccountsRef
      );
      // If the currently active account is being forgotten, disconnect.
      if (forget.find(({ address }) => address === activeAccount) !== undefined)
        setActiveAccount(null);
    }
  };

  // Checks `localStorage` for previously added accounts from the provided source, and adds them to
  // `accounts` state. if local active account is present, it will also be assigned as active.
  // Accounts are ignored if they are already imported through an extension.
  const importLocalOtherAccounts = (
    getter: (n: NetworkName) => ImportedAccount[]
  ) => {
    // Get accounts from provided `getter` function. The resulting array of accounts must contain an
    // `address` field.
    let localAccounts = getter(network);

    if (localAccounts.length) {
      const activeAccountInSet =
        localAccounts.find(
          ({ address }) => address === getActiveAccountLocal(network, ss58)
        ) ?? null;

      // remove already-imported accounts.
      localAccounts = localAccounts.filter(
        (l) =>
          otherAccountsRef.current.find(
            ({ address }) => address === l.address
          ) === undefined
      );

      // set active account for networkData.
      if (activeAccountInSet) setActiveAccount(activeAccountInSet.address);

      // add accounts to imported.
      addOtherAccounts(localAccounts);
    }
  };

  // Renames an other account.
  const renameOtherAccount = (address: MaybeAddress, newName: string) => {
    setStateWithRef(
      [...otherAccountsRef.current].map((a) =>
        a.address !== address
          ? a
          : {
              ...a,
              name: newName,
            }
      ),
      setOtherAccounts,
      otherAccountsRef
    );
  };

  // Adds an external account (non-wallet) to accounts.
  const addExternalAccount = (address: string, addedBy: string) => {
    // ensure account is formatted correctly
    const keyring = new Keyring();
    keyring.setSS58Format(ss58);

    const newEntry = {
      address: keyring.addFromAddress(address).address,
      network,
      name: ellipsisFn(address),
      source: 'external',
      addedBy,
    };

    // get all external accounts from localStorage.
    const localExternalAccounts = getLocalExternalAccounts();
    const existsLocal = localExternalAccounts.find(
      (l) => l.address === newEntry.address && l.network === network
    );

    // check that address is not sitting in imported accounts (currently cannot check which
    // network).
    const existsImported = otherAccountsRef.current.find(
      (a) => a.address === newEntry.address
    );

    // determine whether the account is newly added.
    const isNew = !existsLocal && !existsImported;

    // add external account if not there already.
    if (isNew) {
      localStorage.setItem(
        'external_accounts',
        JSON.stringify(localExternalAccounts.concat(newEntry))
      );
      addOtherAccounts([newEntry]);
    } else if (
      existsLocal &&
      addedBy === 'system' &&
      existsLocal.addedBy !== 'system'
    ) {
      // the external account needs to change to `system` so it cannot be removed. This will replace
      // the whole entry.
      updateLocalExternalAccount(newEntry, 'system');
    }
  };

  // Get any external accounts and remove from localStorage.
  const forgetExternalAccounts = (forget: ImportedAccount[]) => {
    if (!forget.length) return;
    removeLocalExternalAccounts(
      network,
      forget.filter((i) => 'network' in i) as ExternalAccount[]
    );

    // If the currently active account is being forgotten, disconnect.
    if (forget.find((a) => a.address === activeAccount) !== undefined)
      setActiveAccount(null);
  };

  // Unsubscribe all account subscriptions.
  const unsubscribe = () => {
    Object.values(unsubs.current).forEach((unsub) => {
      unsub();
    });
  };

  // Add other accounts to context state.
  const addOtherAccounts = (a: ImportedAccount[]) => {
    setStateWithRef(
      [...otherAccountsRef.current].concat(a),
      setOtherAccounts,
      otherAccountsRef
    );
  };

  // Update local external account with the provided `addedBy` property.
  const updateLocalExternalAccount = (
    entry: ExternalAccount,
    addedBy: 'user' | 'system'
  ) => {
    localStorage.setItem(
      'external_accounts',
      JSON.stringify(
        getLocalExternalAccounts().map((a) =>
          a.address === entry.address
            ? a
            : {
                ...a,
                addedBy,
              }
        )
      )
    );
    setStateWithRef(
      [...otherAccountsRef.current].map((item) =>
        item.address !== entry.address ? item : { ...entry, addedBy }
      ),
      setOtherAccounts,
      otherAccountsRef
    );
  };

  // Re-sync other accounts on network switch. Waits for `injectedWeb3` to be injected.
  useEffect(() => {
    if (!checkingInjectedWeb3) {
      // unsubscribe from all accounts and reset state.
      unsubscribe();
      setStateWithRef([], setOtherAccounts, otherAccountsRef);
    }
    return () => unsubscribe();
  }, [network, checkingInjectedWeb3]);

  // Once extensions are fully initialised, fetch accounts from other sources.
  useEffectIgnoreInitial(() => {
    if (extensionAccountsSynced) {
      // Fetch accounts from supported hardware wallets.
      importLocalOtherAccounts(getLocalVaultAccounts);
      importLocalOtherAccounts(getLocalLedgerAccounts);

      // Mark hardware wallets as initialised.
      setOtherAccountsSynced(true);

      // Finally, fetch any read-only accounts that have been added by `system` or `user`.
      importLocalOtherAccounts(getLocalExternalAccounts);
    }
  }, [extensionAccountsSynced]);

  // Account fetching complete, mark accounts as initialised. Does not include read only accounts.
  useEffectIgnoreInitial(() => {
    if (extensionAccountsSynced && otherAccountsSynced === true) {
      setAccountsInitialised(true);
    }
  }, [extensionAccountsSynced, otherAccountsSynced]);

  return (
    <OtherAccountsContext.Provider
      value={{
        addExternalAccount,
        addOtherAccounts,
        renameOtherAccount,
        importLocalOtherAccounts,
        forgetOtherAccounts,
        forgetExternalAccounts,
        accountsInitialised,
        otherAccounts: otherAccountsRef.current,
      }}
    >
      {children}
    </OtherAccountsContext.Provider>
  );
};

export const useOtherAccounts = () => useContext(OtherAccountsContext);
