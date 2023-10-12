// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNotZero } from '@polkadot-cloud/utils';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemsPerBatch, ListItemsPerPage } from 'consts';
import { useApi } from 'contexts/Api';
import { useFilters } from 'contexts/Filters';
import { useNetworkMetrics } from 'contexts/NetworkMetrics';
import { useTheme } from 'contexts/Themes';
import { useUi } from 'contexts/UI';
import { Header, List, Wrapper as ListWrapper } from 'library/List';
import { MotionContainer } from 'library/List/MotionContainer';
import { Pagination } from 'library/List/Pagination';
import { SearchInput } from 'library/List/SearchInput';
import { Selectable } from 'library/List/Selectable';
import { Validator } from 'library/ValidatorList/Validator';
import type { Validator as ValidatorType } from 'contexts/Validators/types';
import { useOverlay } from '@polkadot-cloud/react/hooks';
import { useNetwork } from 'contexts/Network';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import { useValidatorFilters } from '../Hooks/useValidatorFilters';
import { ListProvider, useList } from '../List/context';
import { Filters } from './Filters';
import type { ValidatorListProps } from './types';

export const ValidatorListInner = ({
  nominator: initialNominator,
  validators: initialValidators,
  allowMoreCols,
  allowFilters,
  toggleFavorites,
  pagination,
  title,
  format,
  selectable,
  bondFor,
  onSelected,
  actions = [],
  showMenu = true,
  displayFor = 'default',
  allowSearch = false,
  allowListFormat = true,
  alwaysRefetchValidators = false,
  defaultFilters = undefined,
  disableThrottle = false,
}: ValidatorListProps) => {
  const { t } = useTranslation('library');
  const { isReady } = useApi();
  const {
    networkData: { colors },
  } = useNetwork();
  const { setModalResize } = useOverlay().modal;
  const provider = useList();
  const { mode } = useTheme();
  const { isSyncing } = useUi();
  const { activeAccount } = useActiveAccounts();
  const { activeEra } = useNetworkMetrics();

  // determine the nominator of the validator list.
  // By default this will be the activeAccount. But for pools,
  // the pool stash address should be the nominator.
  const nominator = initialNominator || activeAccount;

  const { selected, listFormat, setListFormat } = provider;

  const {
    getFilters,
    setMultiFilters,
    getOrder,
    getSearchTerm,
    setSearchTerm,
    resetFilters,
    resetOrder,
    clearSearchTerm,
  } = useFilters();
  const { applyFilter, applyOrder, applySearch } = useValidatorFilters();
  const includes = getFilters('include', 'validators');
  const excludes = getFilters('exclude', 'validators');
  const order = getOrder('validators');
  const searchTerm = getSearchTerm('validators');

  const actionsAll = [...actions].filter((action) => !action.onSelected);
  const actionsSelected = [...actions].filter((action) => action.onSelected);

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, _setRenderIteration] = useState<number>(1);

  // default list of validators
  const [validatorsDefault, setValidatorsDefault] = useState(initialValidators);

  // manipulated list (ordering, filtering) of validators
  const [validators, setValidators] = useState(initialValidators);

  // is this the initial fetch
  const [fetched, setFetched] = useState(false);

  // store whether the search bar is being used
  const [isSearching, setIsSearching] = useState(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    _setRenderIteration(iter);
  };

  // pagination
  const totalPages = Math.ceil(validators.length / ListItemsPerPage);
  const pageEnd = page * ListItemsPerPage - 1;
  const pageStart = pageEnd - (ListItemsPerPage - 1);

  // render batch
  const batchEnd = Math.min(
    renderIteration * ListItemsPerBatch - 1,
    ListItemsPerPage
  );

  // reset list when validator list changes
  useEffect(() => {
    if (alwaysRefetchValidators) {
      if (
        JSON.stringify(initialValidators) !== JSON.stringify(validatorsDefault)
      ) {
        setFetched(false);
      }
    } else {
      setFetched(false);
    }
  }, [initialValidators, nominator]);

  // set default filters
  useEffect(() => {
    if (allowFilters) {
      if (defaultFilters?.includes?.length) {
        setMultiFilters(
          'include',
          'validators',
          defaultFilters?.includes,
          false
        );
      }
      if (defaultFilters?.excludes?.length) {
        setMultiFilters(
          'exclude',
          'validators',
          defaultFilters?.excludes,
          false
        );
      }
    }
    return () => {
      if (allowFilters) {
        resetFilters('exclude', 'validators');
        resetFilters('include', 'validators');
        resetOrder('validators');
        clearSearchTerm('validators');
      }
    };
  }, []);

  // configure validator list when network is ready to fetch
  useEffect(() => {
    if (isReady && isNotZero(activeEra.index) && !fetched) {
      setupValidatorList();
    }
  }, [isReady, activeEra.index, fetched]);

  // render throttle
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 50);
    }
  }, [renderIterationRef.current]);

  // trigger onSelected when selection changes
  useEffect(() => {
    if (onSelected) {
      onSelected(provider);
    }
  }, [selected]);

  // list ui changes / validator changes trigger re-render of list
  useEffect(() => {
    if (allowFilters && fetched) {
      handleValidatorsFilterUpdate();
    }
  }, [order, isSyncing, includes, excludes]);

  // handle modal resize on list format change
  useEffect(() => {
    maybeHandleModalResize();
  }, [listFormat, renderIteration, validators, page]);

  // handle validator list bootstrapping
  const setupValidatorList = () => {
    setValidatorsDefault(initialValidators);
    setValidators(initialValidators);
    setFetched(true);
  };

  // handle filter / order update
  const handleValidatorsFilterUpdate = (
    filteredValidators = Object.assign(validatorsDefault)
  ) => {
    if (allowFilters) {
      if (order !== 'default') {
        filteredValidators = applyOrder(order, filteredValidators);
      }
      filteredValidators = applyFilter(includes, excludes, filteredValidators);
      if (searchTerm) {
        filteredValidators = applySearch(filteredValidators, searchTerm);
      }
      setValidators(filteredValidators);
      setPage(1);
      setRenderIteration(1);
    }
  };

  // get validators to render
  let listValidators = [];

  // get throttled subset or entire list
  if (!disableThrottle) {
    listValidators = validators.slice(pageStart).slice(0, batchEnd);
  } else {
    listValidators = validators;
  }

  // if in modal, handle resize
  const maybeHandleModalResize = () => {
    if (displayFor === 'modal') setModalResize();
  };

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    let filteredValidators = Object.assign(validatorsDefault);
    if (order !== 'default') {
      filteredValidators = applyOrder(order, filteredValidators);
    }
    filteredValidators = applyFilter(includes, excludes, filteredValidators);
    filteredValidators = applySearch(filteredValidators, newValue);

    // ensure no duplicates
    filteredValidators = filteredValidators.filter(
      (value: ValidatorType, index: number, self: ValidatorType[]) =>
        index === self.findIndex((i) => i.address === value.address)
    );

    setValidators(filteredValidators);
    setPage(1);
    setIsSearching(e.currentTarget.value !== '');
    setRenderIteration(1);
    setSearchTerm('validators', newValue);
  };

  return (
    <ListWrapper>
      <Header>
        <div>
          <h4>
            {title ||
              `${t('displayingValidators', {
                count: validators.length,
              })}`}
          </h4>
        </div>
        <div>
          {allowListFormat === true && (
            <>
              <button type="button" onClick={() => setListFormat('row')}>
                <FontAwesomeIcon
                  icon={faBars}
                  color={
                    listFormat === 'row' ? colors.primary[mode] : 'inherit'
                  }
                />
              </button>
              <button type="button" onClick={() => setListFormat('col')}>
                <FontAwesomeIcon
                  icon={faGripVertical}
                  color={
                    listFormat === 'col' ? colors.primary[mode] : 'inherit'
                  }
                />
              </button>
            </>
          )}
        </div>
      </Header>
      <List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {allowSearch && (
          <SearchInput
            handleChange={handleSearchChange}
            placeholder={t('searchAddress')}
          />
        )}

        {allowFilters && <Filters />}

        {listValidators.length > 0 && pagination && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}

        {selectable ? (
          <Selectable
            canSelect={listValidators.length > 0}
            actionsAll={actionsAll}
            actionsSelected={actionsSelected}
          />
        ) : null}

        <MotionContainer>
          {listValidators.length ? (
            <>
              {listValidators.map((validator: ValidatorType, index: number) => (
                <motion.div
                  key={`nomination_${index}`}
                  className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
                  variants={{
                    hidden: {
                      y: 15,
                      opacity: 0,
                    },
                    show: {
                      y: 0,
                      opacity: 1,
                    },
                  }}
                >
                  <Validator
                    validator={validator}
                    nominator={nominator}
                    toggleFavorites={toggleFavorites}
                    format={format}
                    showMenu={showMenu}
                    bondFor={bondFor}
                    displayFor={displayFor}
                  />
                </motion.div>
              ))}
            </>
          ) : (
            <h4 style={{ marginTop: '1rem' }}>
              {isSearching ? t('noValidatorsMatch') : t('noValidators')}
            </h4>
          )}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};

export const ValidatorList = (props: ValidatorListProps) => {
  const { selectActive, selectToggleable } = props;
  return (
    <ListProvider
      selectActive={selectActive}
      selectToggleable={selectToggleable}
    >
      <ValidatorListInner {...props} />
    </ListProvider>
  );
};
