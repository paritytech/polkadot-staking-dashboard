// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useValidators } from 'contexts/Validators';
import { ValidatorList } from 'library/ValidatorList';
import { useModal } from 'contexts/Modal';
import { Container } from 'library/Filter/Container';
import { Category } from 'library/Filter/Category';
import { Item } from 'library/Filter/Item';
import { faThumbtack, faStar } from '@fortawesome/free-solid-svg-icons';
import { Validator } from 'contexts/Validators/types';
import {
  useValidatorFilter,
  ValidatorFilterProvider,
} from 'library/Filter/context';
import { Wrapper } from '../Overview/Announcements/Wrappers';
import { GenerateNominationsInnerProps, Nominations } from './types';

export const GenerateNominationsInner = (
  props: GenerateNominationsInnerProps
) => {
  // functional props
  const setters = props.setters ?? [];
  const defaultNominations = props.nominations;
  const { batchKey } = props;

  const { openModalWith } = useModal();
  const { isReady } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { removeValidatorMetaBatch, validators, meta } = useValidators();
  const { applyValidatorOrder, applyValidatorFilters } = useValidatorFilter();

  let { favouritesList } = useValidators();
  if (favouritesList === null) {
    favouritesList = [];
  }
  // store the method of fetching validators
  const [method, setMethod] = useState<string | null>(null);

  // store whether validators are being fetched
  const [fetching, setFetching] = useState<boolean>(false);

  // store the currently selected set of nominations
  const [nominations, setNominations] = useState(defaultNominations);

  const rawBatchKey = 'validators_browse';

  // update selected value on account switch
  useEffect(() => {
    setNominations(defaultNominations);
  }, [activeAccount, defaultNominations]);

  const fetchFavourites = () => {
    let _favs: Array<Validator> = [];

    if (!favouritesList) {
      return _favs;
    }

    if (favouritesList.length) {
      // take subset of up to 16 favourites
      _favs = favouritesList.slice(0, 16);
    }
    return _favs;
  };

  const fetchMostProfitable = () => {
    // generate nominations from validator list
    let _nominations = Object.assign(validators);
    // filter validators to find profitable candidates
    _nominations = applyValidatorFilters(_nominations, rawBatchKey, [
      'all_commission',
      'blocked_nominations',
      'over_subscribed',
      'inactive',
      'missing_identity',
    ]);
    // order validators to find profitable candidates
    _nominations = applyValidatorOrder(_nominations, 'commission');
    // TODO: unbiased shuffle resulting validators
    // _nominations = shuffle(_nominations);
    // choose subset of validators
    if (_nominations.length) {
      _nominations = _nominations.slice(0, 16);
    }
    return _nominations;
  };

  useEffect(() => {
    if (!isReady || !validators.length) {
      return;
    }

    // wait for validator meta data to be fetched
    const batch = meta[rawBatchKey];
    if (batch === undefined) {
      return;
    }
    if (batch.stake === undefined) {
      return;
    }

    // fetch nominations based on method
    let _nominations;
    if (fetching) {
      switch (method) {
        case 'Favourites':
          _nominations = fetchFavourites();
          break;
        case 'Most Profitable':
          _nominations = fetchMostProfitable();
          break;
        default:
          return;
      }

      // update component state
      setNominations(_nominations);
      setFetching(false);

      // apply update to setters
      updateSetters(_nominations);
    }
  });

  const updateSetters = (_nominations: Nominations) => {
    for (const s of setters) {
      const { current, set } = s;
      const callable = current?.callable ?? false;
      let _current;

      if (!callable) {
        _current = current;
      } else {
        _current = current.fn();
      }
      const _set = {
        ..._current,
        nominations: _nominations,
      };
      set(_set);
    }
  };

  // callback function for adding nominations
  const cbAddNominations = ({ setSelectActive }: any) => {
    setSelectActive(false);

    const updateList = (_nominations: Nominations) => {
      setMethod(null);
      removeValidatorMetaBatch(batchKey);
      setNominations(_nominations);
      updateSetters(_nominations);
    };
    openModalWith(
      'SelectFavourites',
      {
        nominations,
        callback: updateList,
      },
      'large'
    );
  };

  // callback function for clearing nomination list
  const cbClearNominations = ({ resetSelected }: any) => {
    setMethod(null);
    removeValidatorMetaBatch(batchKey);
    setNominations([]);
    updateSetters([]);
    resetSelected();
  };

  // callback function for removing selected validators
  const cbRemoveSelected = ({
    selected,
    resetSelected,
    setSelectActive,
  }: any) => {
    setMethod('From List');
    removeValidatorMetaBatch(batchKey);
    const _nominations = [...nominations].filter((n: any) => {
      return !selected.map((_s: any) => _s.address).includes(n.address);
    });
    setNominations(_nominations);
    updateSetters(_nominations);
    setSelectActive(false);
    resetSelected();
  };

  return (
    <Wrapper>
      <div>
        {!isReadOnlyAccount(activeAccount) && !nominations.length && (
          <>
            <Container>
              <Category title="Generate Method">
                <Item
                  label="Most Profitable"
                  icon={faStar}
                  transform="grow-2"
                  active={false}
                  onClick={() => {
                    setMethod('Most Profitable');
                    removeValidatorMetaBatch(batchKey);
                    setNominations([]);
                    setFetching(true);
                  }}
                  width={175}
                />
                <Item
                  label="From Favourites"
                  icon={faThumbtack}
                  transform="grow-2"
                  disabled={!favouritesList.length}
                  active={false}
                  onClick={() => {
                    setMethod('Favourites');
                    removeValidatorMetaBatch(batchKey);
                    setNominations([]);
                    setFetching(true);
                  }}
                  width={175}
                />
              </Category>
            </Container>
          </>
        )}
      </div>
      {fetching ? (
        <></>
      ) : (
        <>
          {isReady && nominations.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              <ValidatorList
                validators={nominations}
                batchKey={batchKey}
                selectable
                actions={[
                  {
                    title: 'Start Again',
                    onClick: cbClearNominations,
                    onSelected: false,
                  },
                  {
                    disabled: !favouritesList.length,
                    title: 'Add From Favourites',
                    onClick: cbAddNominations,
                    onSelected: false,
                  },
                  {
                    title: `Remove Selected`,
                    onClick: cbRemoveSelected,
                    onSelected: true,
                  },
                ]}
                allowMoreCols
              />
            </div>
          ) : (
            <div className="head">
              <h3>No Nominations.</h3>
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};

export const GenerateNominations = (props: GenerateNominationsInnerProps) => {
  return (
    <ValidatorFilterProvider>
      <GenerateNominationsInner {...props} />
    </ValidatorFilterProvider>
  );
};

export default GenerateNominations;
