// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { shuffle } from '@polkadot-cloud/utils';
import { useFavoriteValidators } from 'contexts/Validators/FavoriteValidators';
import { useValidators } from 'contexts/Validators/ValidatorEntries';
import type { Validator } from 'contexts/Validators/types';
import { useValidatorFilters } from 'library/Hooks/useValidatorFilters';

export const useFetchMehods = () => {
  const { favoritesList } = useFavoriteValidators();
  const { applyFilter, applyOrder } = useValidatorFilters();
  const { validators, sessionParaValidators } = useValidators();

  const fetch = (method: string) => {
    let nominations;
    switch (method) {
      case 'Optimal Selection':
        nominations = fetchOptimal();
        break;
      case 'Active Low Commission':
        nominations = fetchLowCommission();
        break;
      case 'From Favorites':
        nominations = fetchFavorites();
        break;
      default:
        return [];
    }
    return nominations;
  };

  const add = (nominations: any, type: string) => {
    switch (type) {
      case 'Parachain Validator':
        nominations = addParachainValidator(nominations);
        break;
      case 'Active Validator':
        nominations = addActiveValidator(nominations);
        break;
      case 'Random Validator':
        nominations = addRandomValidator(nominations);
        break;
      default:
        return nominations;
    }
    return nominations;
  };

  const fetchFavorites = () => {
    let favs: Validator[] = [];

    if (!favoritesList) {
      return favs;
    }

    if (favoritesList?.length) {
      // take subset of up to 16 favorites
      favs = favoritesList.slice(0, 16);
    }
    return favs;
  };

  const fetchLowCommission = () => {
    let filtered = Object.assign(validators);

    // filter validators to find active candidates
    filtered = applyFilter(
      ['active'],
      ['all_commission', 'blocked_nominations', 'missing_identity'],
      filtered
    );

    // order validators to find profitable candidates
    filtered = applyOrder('low_commission', filtered);

    // choose shuffled subset of validators
    if (filtered.length) {
      filtered = shuffle(filtered.slice(0, filtered.length * 0.5)).slice(0, 16);
    }
    return filtered;
  };

  const fetchOptimal = () => {
    let active = Object.assign(validators);
    let waiting = Object.assign(validators);

    // filter validators to find waiting candidates
    waiting = applyFilter(
      null,
      [
        'all_commission',
        'blocked_nominations',
        'missing_identity',
        'in_session',
      ],
      waiting
    );

    // filter validators to find active candidates
    active = applyFilter(
      ['active'],
      ['all_commission', 'blocked_nominations', 'missing_identity'],
      active
    );

    // choose shuffled subset of waiting
    if (waiting.length) {
      waiting = shuffle(waiting).slice(0, 4);
    }
    // choose shuffled subset of active
    if (waiting.length) {
      active = shuffle(active).slice(0, 12);
    }

    return shuffle(waiting.concat(active));
  };

  const available = (nominations: any) => {
    const all = Object.assign(validators);

    const parachainActive = applyFilter(
      ['active'],
      [
        'all_commission',
        'blocked_nominations',
        'missing_identity',
        'not_parachain_validator',
      ],
      all
    ).filter(
      (n: any) => !nominations.find((o: any) => o.address === n.address)
    );

    const active = applyFilter(
      ['active'],
      ['all_commission', 'blocked_nominations', 'missing_identity'],
      all
    )
      .filter(
        (n: any) => !nominations.find((o: any) => o.address === n.address)
      )
      .filter((n: any) => !sessionParaValidators?.includes(n.address) || false);

    const random = applyFilter(
      null,
      ['all_commission', 'blocked_nominations', 'missing_identity'],
      all
    ).filter(
      (n: any) => !nominations.find((o: any) => o.address === n.address)
    );

    return {
      parachainValidators: parachainActive,
      activeValidators: active,
      randomValidators: random,
    };
  };

  const addActiveValidator = (nominations: any) => {
    const all = available(nominations).activeValidators;

    // take one validator
    const validator = shuffle(all).slice(0, 1)[0] || null;
    if (validator) {
      nominations.push(validator);
    }
    return nominations;
  };

  const addParachainValidator = (nominations: any) => {
    const all = available(nominations).parachainValidators;

    // take one validator
    const validator = shuffle(all).slice(0, 1)[0] || null;
    if (validator) {
      nominations.push(validator);
    }
    return nominations;
  };

  const addRandomValidator = (nominations: any) => {
    const all = available(nominations).randomValidators;

    // take one validator
    const validator = shuffle(all).slice(0, 1)[0] || null;

    if (validator) {
      nominations.push(validator);
    }
    return nominations;
  };

  return {
    fetch,
    add,
    available,
  };
};
