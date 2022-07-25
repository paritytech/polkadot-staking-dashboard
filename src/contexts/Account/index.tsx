// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from 'react';
import { setStateWithRef } from 'Utils';
import { AnyApi, AnyMetaBatch } from 'types';
import { useApi } from '../Api';
import { defaultAccountContext } from './defaults';
import { AccountContextInterface } from './types';

// context definition
export const AccountContext = React.createContext<AccountContextInterface>(
  defaultAccountContext
);

export const useAccount = () => React.useContext(AccountContext);

// wrapper component to provide components with context
export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isReady, api } = useApi();

  // stores the meta data batches for validator lists
  const [accountMetaBatches, setAccountMetaBatch] = useState<AnyMetaBatch>({});
  const accountMetaBatchesRef = useRef(accountMetaBatches);

  // stores the meta batch subscriptions for validator lists
  const [accountSubs, setAccountSubs] = useState<AnyApi>({});
  const accountSubsRef = useRef(accountSubs);

  // unsubscribe from any validator meta batches
  useEffect(() => {
    return () => {
      Object.values(accountSubsRef.current).map((batch: AnyMetaBatch) => {
        return Object.entries(batch).map(([, v]: AnyApi) => {
          return v();
        });
      });
    };
  }, []);

  /*
    Fetches a new batch of subscribed accounts metadata. Stores the returning
    metadata alongside the unsubscribe function in state.
    structure:
    {
      key: {
        [
          {
          addresses [],
          identities: [],
        }
      ]
    },
  };
  */
  const fetchAccountMetaBatch = async (
    key: string,
    addresses: string[],
    refetch = false
  ) => {
    if (!isReady || !api) {
      return;
    }

    if (!addresses.length) {
      return;
    }

    if (!refetch) {
      // if already exists, do not re-fetch
      if (accountMetaBatchesRef.current[key] !== undefined) {
        return;
      }
    } else {
      // tidy up if existing batch exists
      delete accountMetaBatches[key];
      delete accountMetaBatchesRef.current[key];

      if (accountSubsRef.current[key] !== undefined) {
        for (const unsub of accountSubsRef.current[key]) {
          unsub();
        }
      }
    }

    // store batch addresses
    const batchesUpdated = Object.assign(accountMetaBatchesRef.current);
    batchesUpdated[key] = {};
    batchesUpdated[key].addresses = addresses;
    setStateWithRef(
      { ...batchesUpdated },
      setAccountMetaBatch,
      accountMetaBatchesRef
    );

    const subscribeToIdentities = async (addr: string[]) => {
      const unsub = await api.query.identity.identityOf.multi(
        addr,
        (_identities) => {
          const identities = [];
          for (let i = 0; i < _identities.length; i++) {
            identities.push(_identities[i].toHuman());
          }
          const _batchesUpdated = Object.assign(accountMetaBatchesRef.current);
          _batchesUpdated[key].identities = identities;
          setStateWithRef(
            { ..._batchesUpdated },
            setAccountMetaBatch,
            accountMetaBatchesRef
          );
        }
      );
      return unsub;
    };

    const subscribeToSuperIdentities = async (addr: string[]) => {
      const unsub = await api.query.identity.superOf.multi(
        addr,
        async (_supers) => {
          // determine where supers exist
          const supers: AnyApi = [];
          const supersWithIdentity: AnyApi = [];

          for (let i = 0; i < _supers.length; i++) {
            const _super = _supers[i].toHuman();
            supers.push(_super);
            if (_super !== null) {
              supersWithIdentity.push(i);
            }
          }

          // get supers one-off multi query
          const query = supers
            .filter((s: AnyApi) => s !== null)
            .map((s: AnyApi) => s[0]);

          const temp = await api.query.identity.identityOf.multi(
            query,
            (_identities) => {
              for (let j = 0; j < _identities.length; j++) {
                const _identity = _identities[j].toHuman();
                // inject identity into super array
                supers[supersWithIdentity[j]].identity = _identity;
              }
            }
          );
          temp();

          const _batchesUpdated = Object.assign(accountMetaBatchesRef.current);
          _batchesUpdated[key].supers = supers;
          setStateWithRef(
            { ..._batchesUpdated },
            setAccountMetaBatch,
            accountMetaBatchesRef
          );
        }
      );
      return unsub;
    };

    await Promise.all([
      subscribeToIdentities(addresses),
      subscribeToSuperIdentities(addresses),
    ]).then((unsubs) => {
      addMetaBatchUnsubs(key, unsubs);
    });
  };

  /*
   * Helper function to add mataBatch unsubs by key.
   */
  const addMetaBatchUnsubs = (key: string, unsubs: AnyApi) => {
    const _unsubs = accountSubsRef.current;
    const _keyUnsubs = _unsubs[key] ?? [];

    _keyUnsubs.push(...unsubs);
    _unsubs[key] = _keyUnsubs;
    setStateWithRef(_unsubs, setAccountSubs, accountSubsRef);
  };

  const removeAccountMetaBatch = (key: string) => {
    if (accountSubsRef.current[key] !== undefined) {
      // ubsubscribe from updates
      for (const unsub of accountSubsRef.current[key]) {
        unsub();
      }
      // wipe data
      delete accountMetaBatches[key];
      delete accountMetaBatchesRef.current[key];
    }
  };

  return (
    <AccountContext.Provider
      value={{
        fetchAccountMetaBatch,
        removeAccountMetaBatch,
        meta: accountMetaBatchesRef.current,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
