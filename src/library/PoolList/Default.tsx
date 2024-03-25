// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNotZero } from '@w3ux/utils';
import { motion } from 'framer-motion';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listItemsPerBatch, listItemsPerPage } from 'library/List/defaults';
import { useApi } from 'contexts/Api';
import { useFilters } from 'contexts/Filters';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { useTheme } from 'contexts/Themes';
import { Tabs } from 'library/Filter/Tabs';
import { usePoolFilters } from 'hooks/usePoolFilters';
import {
  FilterHeaderWrapper,
  List,
  ListStatusHeader,
  Wrapper as ListWrapper,
} from 'library/List';
import { MotionContainer } from 'library/List/MotionContainer';
import { Pagination } from 'library/List/Pagination';
import { SearchInput } from 'library/List/SearchInput';
import { Pool } from 'library/Pool';
import { useNetwork } from 'contexts/Network';
import { usePoolList } from './context';
import type { PoolListProps } from './types';
import type { BondedPool } from 'contexts/Pools/BondedPools/types';
import { useSyncing } from 'hooks/useSyncing';

export const PoolList = ({
  allowMoreCols,
  pagination,
  disableThrottle,
  allowSearch,
  pools,
  defaultFilters,
  allowListFormat = true,
}: PoolListProps) => {
  const { t } = useTranslation('library');
  const { mode } = useTheme();
  const { isReady, activeEra } = useApi();
  const {
    networkData: { colors },
  } = useNetwork();
  const { syncing } = useSyncing('*');
  const { applyFilter } = usePoolFilters();
  const { listFormat, setListFormat } = usePoolList();
  const { getFilters, setMultiFilters, getSearchTerm, setSearchTerm } =
    useFilters();
  const { poolSearchFilter, poolsNominations } = useBondedPools();

  const includes = getFilters('include', 'pools');
  const excludes = getFilters('exclude', 'pools');
  const searchTerm = getSearchTerm('pools');

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, setRenderIterationState] = useState<number>(1);

  // default list of pools
  const [poolsDefault, setPoolsDefault] = useState<BondedPool[]>(pools || []);

  // manipulated list (ordering, filtering) of pools
  const [listPools, setListPools] = useState<BondedPool[]>(pools || []);

  // is this the initial fetch
  const [fetched, setFetched] = useState<boolean>(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    setRenderIterationState(iter);
  };

  // pagination
  const totalPages = Math.ceil(listPools.length / listItemsPerPage);
  const pageEnd = page * listItemsPerPage - 1;
  const pageStart = pageEnd - (listItemsPerPage - 1);

  // render batch
  const batchEnd = Math.min(
    renderIteration * listItemsPerBatch - 1,
    listItemsPerPage
  );

  // get throttled subset or entire list
  const poolsToDisplay = disableThrottle
    ? listPools
    : listPools.slice(pageStart).slice(0, listItemsPerPage);

  // handle pool list bootstrapping
  const setupPoolList = () => {
    setPoolsDefault(pools || []);
    setListPools(pools || []);
    setFetched(true);
  };

  // handle filter / order update
  const handlePoolsFilterUpdate = (
    filteredPools = Object.assign(poolsDefault)
  ) => {
    filteredPools = applyFilter(includes, excludes, filteredPools);
    if (searchTerm) {
      filteredPools = poolSearchFilter(filteredPools, searchTerm);
    }
    setListPools(filteredPools);
    setPage(1);
    setRenderIteration(1);
  };

  const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    let filteredPools = Object.assign(poolsDefault);
    filteredPools = applyFilter(includes, excludes, filteredPools);
    filteredPools = poolSearchFilter(filteredPools, newValue);

    // ensure no duplicates
    filteredPools = filteredPools.filter(
      (value: BondedPool, index: number, self: BondedPool[]) =>
        index === self.findIndex((i) => i.id === value.id)
    );
    setPage(1);
    setRenderIteration(1);
    setListPools(filteredPools);
    setSearchTerm('pools', newValue);
  };

  // Refetch list when pool list changes.
  useEffect(() => {
    if (pools !== poolsDefault) {
      setFetched(false);
    }
  }, [pools]);

  // Configure pool list when network is ready to fetch.
  useEffect(() => {
    if (isReady && isNotZero(activeEra.index) && !fetched) {
      setupPoolList();
    }
  }, [isReady, fetched, activeEra.index]);

  // Render throttling. Only render a batch of pools at a time.
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 500);
    }
  }, [renderIterationRef.current]);

  // List ui changes / validator changes trigger re-render of list.
  useEffect(() => {
    // only filter when pool nominations have been synced.
    if (!syncing && Object.keys(poolsNominations).length) {
      handlePoolsFilterUpdate();
    }
  }, [syncing, includes, excludes, Object.keys(poolsNominations).length]);

  // Scroll to top of the window on every filter.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [includes, excludes]);

  // Set default filters.
  useEffect(() => {
    if (defaultFilters?.includes?.length) {
      setMultiFilters('include', 'pools', defaultFilters?.includes, false);
    }
    if (defaultFilters?.excludes?.length) {
      setMultiFilters('exclude', 'pools', defaultFilters?.excludes, false);
    }
  }, []);

  return (
    <ListWrapper>
      <List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {allowSearch && poolsDefault.length > 0 && (
          <SearchInput
            value={searchTerm ?? ''}
            handleChange={handleSearchChange}
            placeholder={t('search')}
          />
        )}
        <FilterHeaderWrapper>
          <div>
            <Tabs
              config={[
                {
                  label: t('all'),
                  includes: [],
                  excludes: [],
                },
                {
                  label: t('active'),
                  includes: ['active'],
                  excludes: ['locked', 'destroying'],
                },
                {
                  label: t('locked'),
                  includes: ['locked'],
                  excludes: [],
                },
                {
                  label: t('destroying'),
                  includes: ['destroying'],
                  excludes: [],
                },
              ]}
              activeIndex={1}
            />
          </div>
          <div>
            {allowListFormat && (
              <div>
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
              </div>
            )}
          </div>
        </FilterHeaderWrapper>

        {pagination && poolsToDisplay.length > 0 && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}
        <MotionContainer>
          {poolsToDisplay.length ? (
            <>
              {poolsToDisplay.map((pool, index: number) => (
                <motion.div
                  className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
                  key={`nomination_${index}`}
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
                  <Pool pool={pool} />
                </motion.div>
              ))}
            </>
          ) : (
            <ListStatusHeader>
              {syncing ? `${t('syncingPoolList')}...` : t('noMatch')}
            </ListStatusHeader>
          )}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};
