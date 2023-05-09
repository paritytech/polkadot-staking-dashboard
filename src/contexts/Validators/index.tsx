// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  greaterThanZero,
  planckToUnit,
  rmCommas,
  setStateWithRef,
  shuffle,
} from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { ValidatorCommunity } from 'config/validators';
import type {
  SessionParachainValidators,
  SessionValidators,
  Validator,
  ValidatorAddresses,
  ValidatorsContextInterface,
} from 'contexts/Validators/types';
import React, { useEffect, useRef, useState } from 'react';
import type { AnyApi, AnyMetaBatch, Fn } from 'types';
import { useApi } from '../Api';
import { useBonded } from '../Bonded';
import { useConnect } from '../Connect';
import { useNetworkMetrics } from '../Network';
import { useActivePools } from '../Pools/ActivePools';
import * as defaults from './defaults';

// wrapper component to provide components with context
export const ValidatorsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isReady, api, network, consts } = useApi();
  const { activeAccount } = useConnect();
  const { activeEra, metrics } = useNetworkMetrics();
  const { bondedAccounts, getAccountNominations } = useBonded();
  const { poolNominations } = useActivePools();
  const { units } = network;
  const { maxNominatorRewardedPerValidator } = consts;
  const { earliestStoredSession } = metrics;

  // stores the total validator entries
  const [validators, setValidators] = useState<Validator[]>([]);

  // track whether the validator list has been fetched yet
  const [fetchedValidators, setFetchedValidators] = useState<number>(0);

  // stores the currently active validator set
  const [sessionValidators, setSessionValidators] = useState<SessionValidators>(
    defaults.sessionValidators
  );

  // stores the average network commission rate
  const [avgCommission, setAvgCommission] = useState(0);

  // stores the currently active parachain validator set
  const [sessionParachainValidators, setSessionParachainValidators] =
    useState<SessionParachainValidators>(defaults.sessionParachainValidators);

  // stores the meta data batches for validator lists
  const [validatorMetaBatches, setValidatorMetaBatch] = useState<AnyMetaBatch>(
    {}
  );
  const validatorMetaBatchesRef = useRef(validatorMetaBatches);

  // stores the meta batch subscriptions for validator lists
  const validatorSubsRef = useRef<Record<string, Fn[]>>({});

  // get favorites from local storage
  const getFavorites = () => {
    const localFavourites = localStorage.getItem(`${network.name}_favorites`);
    return localFavourites !== null ? JSON.parse(localFavourites) : [];
  };

  // stores the user's favorite validators
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

  // stores the user's nominated validators as list
  const [nominated, setNominated] = useState<Validator[] | null>(null);

  // stores the nominated validators by the members pool's as list
  const [poolNominated, setPoolNominated] = useState<Validator[] | null>(null);

  // stores the user's favorites validators as list
  const [favoritesList, setFavoritesList] = useState<Validator[] | null>(null);

  // stores validator community

  const [validatorCommunity] = useState<any>([...shuffle(ValidatorCommunity)]);

  // reset validators list on network change
  useEffect(() => {
    setFetchedValidators(0);
    setSessionValidators(defaults.sessionValidators);
    setSessionParachainValidators(defaults.sessionParachainValidators);
    removeValidatorMetaBatch('validators_browse');
    setAvgCommission(0);
    setValidators([]);
  }, [network]);

  // fetch validators and session validators when activeEra ready
  useEffect(() => {
    if (isReady) {
      fetchValidators();
      subscribeSessionValidators();
    }

    return () => {
      // unsubscribe from any validator meta batches
      Object.values(validatorSubsRef.current).map((batch: AnyMetaBatch) =>
        Object.entries(batch).map(([, v]: AnyApi) => v())
      );
    };
  }, [isReady, activeEra]);

  // fetch parachain session validators when earliestStoredSession ready
  useEffect(() => {
    if (isReady && greaterThanZero(earliestStoredSession)) {
      subscribeParachainValidators();
    }
  }, [isReady, earliestStoredSession]);

  // pre-populating validator meta batches. Needed for generating nominations
  useEffect(() => {
    if (validators.length > 0) {
      fetchValidatorMetaBatch('validators_browse', validators, true);
    }
  }, [isReady, validators]);

  // fetch active account's nominations in validator list format
  useEffect(() => {
    if (isReady && activeAccount) {
      fetchNominatedList();
    }
  }, [isReady, activeAccount, bondedAccounts]);

  const fetchNominatedList = async () => {
    if (!activeAccount) {
      return;
    }
    // get raw targets list
    const targets = getAccountNominations(activeAccount);

    // format to list format
    const targetsFormatted = targets.map((item: any) => ({ address: item }));
    // fetch preferences
    const nominationsWithPrefs = await fetchValidatorPrefs(targetsFormatted);
    if (nominationsWithPrefs) {
      setNominated(nominationsWithPrefs);
      return;
    }

    // return empty otherwise.
    setNominated([]);
  };

  // fetch active account's pool nominations in validator list format
  useEffect(() => {
    if (isReady && poolNominations) {
      fetchPoolNominatedList();
    }
  }, [isReady, poolNominations]);

  const fetchPoolNominatedList = async () => {
    // get raw nominations list
    let n = poolNominations.targets;
    // format to list format
    n = n.map((item: string) => ({ address: item }));
    // fetch preferences
    const nominationsWithPrefs = await fetchValidatorPrefs(n);
    if (nominationsWithPrefs) {
      setPoolNominated(nominationsWithPrefs);
    } else {
      setPoolNominated([]);
    }
  };

  // re-fetch favorites on network change
  useEffect(() => {
    setFavorites(getFavorites());
  }, [network]);

  // fetch favorites in validator list format
  useEffect(() => {
    if (isReady) {
      fetchFavoriteList();
    }
  }, [isReady, favorites]);

  const fetchFavoriteList = async () => {
    // format to list format
    const _favorites = [...favorites].map((item) => ({
      address: item,
    }));
    // // fetch preferences
    const favoritesWithPrefs = await fetchValidatorPrefs(_favorites);
    if (favoritesWithPrefs) {
      setFavoritesList(favoritesWithPrefs);
    } else {
      setFavoritesList([]);
    }
  };

  /*
   * Fetches the active validator set.
   * Validator meta batches are derived from this initial list.
   */
  const fetchValidators = async () => {
    if (!isReady || !api) {
      return;
    }

    // return if fetching not started
    if ([1, 2].includes(fetchedValidators)) {
      return;
    }

    setFetchedValidators(1);

    // fetch validator set
    const v: Validator[] = [];
    let totalNonAllCommission = new BigNumber(0);
    const exposures = await api.query.staking.validators.entries();
    exposures.forEach(([a, p]: AnyApi) => {
      const address = a.args[0].toHuman();
      const prefs = p.toHuman();

      const commission = new BigNumber(prefs.commission.slice(0, -1));

      if (!commission.isEqualTo(100)) {
        totalNonAllCommission = totalNonAllCommission.plus(commission);
      }

      v.push({
        address,
        prefs: {
          commission: Number(commission.toFixed(2)),
          blocked: prefs.blocked,
        },
      });
    });

    // get average network commission for all non-100% commissioned validators.
    const notFullCommissionCount = exposures.filter(
      (e: AnyApi) => e.commission !== '100%'
    ).length;

    const average = notFullCommissionCount
      ? totalNonAllCommission
          .dividedBy(notFullCommissionCount)
          .decimalPlaces(2)
          .toNumber()
      : 0;

    setFetchedValidators(2);
    setAvgCommission(average);
    // shuffle validators before setting them.
    setValidators(shuffle(v));
  };

  /*
   * subscribe to active session
   */
  const subscribeSessionValidators = async () => {
    if (api !== null && isReady) {
      const unsub: AnyApi = await api.query.session.validators((v: AnyApi) => {
        setSessionValidators({
          ...sessionValidators,
          list: v.toHuman(),
          unsub,
        });
      });
    }
  };

  /*
   * subscribe to active parachain validators
   */
  const subscribeParachainValidators = async () => {
    if (api !== null && isReady) {
      const unsub: AnyApi = await api.query.paraSessionInfo.accountKeys(
        earliestStoredSession.toString(),
        (v: AnyApi) => {
          setSessionParachainValidators({
            ...sessionParachainValidators,
            list: v.toHuman(),
            unsub,
          });
        }
      );
    }
  };

  /*
   * fetches prefs for a list of validators
   */
  const fetchValidatorPrefs = async (addresses: ValidatorAddresses) => {
    if (!addresses.length || !api) {
      return null;
    }

    const v: string[] = [];
    for (const address of addresses) {
      v.push(address.address);
    }

    const allPrefs = await api.query.staking.validators.multi(v);

    const validatorsWithPrefs = [];
    let i = 0;
    for (const p of allPrefs) {
      const prefs: AnyApi = p.toHuman();

      validatorsWithPrefs.push({
        address: v[i],
        prefs: {
          commission: prefs?.commission.slice(0, -1) ?? '0',
          blocked: prefs.blocked,
        },
      });
      i++;
    }
    return validatorsWithPrefs;
  };

  /*
    Fetches a new batch of subscribed validator metadata. Stores the returning
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
  const fetchValidatorMetaBatch = async (
    key: string,
    v: AnyMetaBatch,
    refetch = false
  ) => {
    if (!isReady || !api) {
      return;
    }

    if (!v.length) {
      return;
    }

    if (!refetch) {
      // if already exists, do not re-fetch
      if (validatorMetaBatchesRef.current[key] !== undefined) {
        return;
      }
    } else {
      // tidy up if existing batch exists
      const updatedValidatorMetaBatches: AnyMetaBatch = {
        ...validatorMetaBatchesRef.current,
      };
      delete updatedValidatorMetaBatches[key];
      setStateWithRef(
        updatedValidatorMetaBatches,
        setValidatorMetaBatch,
        validatorMetaBatchesRef
      );

      if (validatorSubsRef.current[key] !== undefined) {
        for (const unsub of validatorSubsRef.current[key]) {
          unsub();
        }
      }
    }

    const addresses = [];
    for (const address of v) {
      addresses.push(address.address);
    }

    // store batch addresses
    const batchesUpdated = Object.assign(validatorMetaBatchesRef.current);
    batchesUpdated[key] = {};
    batchesUpdated[key].addresses = addresses;
    setStateWithRef(
      { ...batchesUpdated },
      setValidatorMetaBatch,
      validatorMetaBatchesRef
    );

    const subscribeToIdentities = async (addr: AnyApi) => {
      const unsub = await api.query.identity.identityOf.multi<AnyApi>(
        addr,
        (_identities) => {
          const identities = [];
          for (let i = 0; i < _identities.length; i++) {
            identities.push(_identities[i].toHuman());
          }
          const _batchesUpdated = Object.assign(
            validatorMetaBatchesRef.current
          );

          // check if batch still exists before updating
          if (_batchesUpdated[key]) {
            _batchesUpdated[key].identities = identities;
            setStateWithRef(
              { ..._batchesUpdated },
              setValidatorMetaBatch,
              validatorMetaBatchesRef
            );
          }
        }
      );
      return unsub;
    };

    const subscribeToSuperIdentities = async (addr: AnyApi) => {
      const unsub = await api.query.identity.superOf.multi<AnyApi>(
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

          const temp = await api.query.identity.identityOf.multi<AnyApi>(
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

          const _batchesUpdated = Object.assign(
            validatorMetaBatchesRef.current
          );

          // check if batch still exists before updating
          if (_batchesUpdated[key]) {
            _batchesUpdated[key].supers = supers;
            setStateWithRef(
              { ..._batchesUpdated },
              setValidatorMetaBatch,
              validatorMetaBatchesRef
            );
          }
        }
      );
      return unsub;
    };

    await Promise.all([
      subscribeToIdentities(addresses),
      subscribeToSuperIdentities(addresses),
    ]).then((unsubs: Fn[]) => {
      addMetaBatchUnsubs(key, unsubs);
    });

    // subscribe to validator nominators
    const args: AnyApi = [];

    for (let i = 0; i < v.length; i++) {
      args.push([activeEra.index.toString(), v[i].address]);
    }

    const unsub3 = await api.query.staking.erasStakers.multi<AnyApi>(
      args,
      (_validators) => {
        const stake = [];

        for (let _validator of _validators) {
          _validator = _validator.toHuman();
          let others = _validator.others ?? [];

          // account for yourself being an additional nominator.
          const totalNominations = others.length + 1;

          // reformat others.value properties from string to BigNumber.
          others = others.map((other: AnyApi) => ({
            ...other,
            value: new BigNumber(rmCommas(other.value)),
          }));

          // sort others lowest first.
          others = others.sort((a: AnyApi, b: AnyApi) =>
            a.value.minus(b.value)
          );

          // get the lowest reward stake of the validator, which is
          // the largest index - `maxNominatorRewardedPerValidator`,
          // or the first index if does not exist.
          const lowestRewardIndex = Math.max(
            others.length - maxNominatorRewardedPerValidator.toNumber(),
            0
          );

          const lowestReward =
            others.length > 0
              ? planckToUnit(others[lowestRewardIndex]?.value, units)
              : 0;

          stake.push({
            total: _validator.total,
            own: _validator.own,
            total_nominations: totalNominations,
            lowestReward,
          });
        }

        // commit update
        const _batchesUpdated = Object.assign(validatorMetaBatchesRef.current);

        // check if batch still exists before updating
        if (_batchesUpdated[key]) {
          _batchesUpdated[key].stake = stake;
          setStateWithRef(
            { ..._batchesUpdated },
            setValidatorMetaBatch,
            validatorMetaBatchesRef
          );
        }
      }
    );

    addMetaBatchUnsubs(key, [unsub3]);
  };

  /*
   * Helper function to add mataBatch unsubs by key.
   */
  const addMetaBatchUnsubs = (key: string, unsubs: Fn[]) => {
    const newUnsubs = validatorSubsRef.current;
    const keyUnsubs = newUnsubs[key] ?? [];

    keyUnsubs.push(...unsubs);
    newUnsubs[key] = keyUnsubs;
    validatorSubsRef.current = newUnsubs;
  };

  const removeValidatorMetaBatch = (key: string) => {
    if (validatorSubsRef.current[key] !== undefined) {
      // ubsubscribe from updates
      for (const unsub of validatorSubsRef.current[key]) {
        unsub();
      }
      // wipe data
      const updatedValidatorMetaBatches: AnyMetaBatch = {
        ...validatorMetaBatchesRef.current,
      };
      delete updatedValidatorMetaBatches[key];
      setStateWithRef(
        updatedValidatorMetaBatches,
        setValidatorMetaBatch,
        validatorMetaBatchesRef
      );
    }
  };

  /*
   * Adds a favorite validator.
   */
  const addFavorite = (address: string) => {
    const _favorites: any = Object.assign(favorites);
    if (!_favorites.includes(address)) {
      _favorites.push(address);
    }

    localStorage.setItem(
      `${network.name}_favorites`,
      JSON.stringify(_favorites)
    );
    setFavorites([..._favorites]);
  };

  /*
   * Removes a favorite validator if they exist.
   */
  const removeFavorite = (address: string) => {
    let _favorites = Object.assign(favorites);
    _favorites = _favorites.filter(
      (validator: string) => validator !== address
    );
    localStorage.setItem(
      `${network.name}_favorites`,
      JSON.stringify(_favorites)
    );
    setFavorites([..._favorites]);
  };

  return (
    <ValidatorsContext.Provider
      value={{
        fetchValidatorMetaBatch,
        removeValidatorMetaBatch,
        fetchValidatorPrefs,
        addFavorite,
        removeFavorite,
        validators,
        avgCommission,
        meta: validatorMetaBatchesRef.current,
        session: sessionValidators,
        sessionParachain: sessionParachainValidators.list,
        favorites,
        nominated,
        poolNominated,
        favoritesList,
        validatorCommunity,
      }}
    >
      {children}
    </ValidatorsContext.Provider>
  );
};

export const ValidatorsContext =
  React.createContext<ValidatorsContextInterface>(
    defaults.defaultValidatorsContext
  );

export const useValidators = () => React.useContext(ValidatorsContext);
