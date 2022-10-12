// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'contexts/Api';
import { StakingContext } from 'contexts/Staking';
import { useNetworkMetrics } from 'contexts/Network';
import { LIST_ITEMS_PER_PAGE, LIST_ITEMS_PER_BATCH } from 'consts';
import { Pool } from 'library/Pool';
import { List, Header, Wrapper as ListWrapper } from 'library/List';
import { useTheme } from 'contexts/Themes';
import { networkColors } from 'theme/default';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { Pagination } from 'library/List/Pagination';
import { MotionContainer } from 'library/List/MotionContainer';
import { SearchInput } from 'library/List/SearchInput';
import { useUi } from 'contexts/UI';
import { useTranslation } from 'react-i18next';
import { PoolListProvider, usePoolList } from './context';
import { PoolListProps } from './types';

export const PoolListInner = (props: PoolListProps) => {
  const { allowMoreCols, pagination, batchKey }: any = props;
  const disableThrottle = props.disableThrottle ?? false;
  const allowSearch = props.allowSearch ?? false;
  const { t } = useTranslation('common');

  const { mode } = useTheme();
  const { isReady, network } = useApi();
  const { metrics } = useNetworkMetrics();
  const { fetchPoolsMetaBatch, poolSearchFilter } = useBondedPools();
  const { listFormat, setListFormat } = usePoolList();
  const { isSyncing } = useUi();

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, _setRenderIteration] = useState<number>(1);

  // default list of pools
  const [poolsDefault, setPoolsDefault] = useState(props.pools);

  // manipulated list (ordering, filtering) of pools
  const [pools, setPools] = useState(props.pools);

  // is this the initial fetch
  const [fetched, setFetched] = useState<boolean>(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    _setRenderIteration(iter);
  };

  // pagination
  const totalPages = Math.ceil(pools.length / LIST_ITEMS_PER_PAGE);
  const pageEnd = page * LIST_ITEMS_PER_PAGE - 1;
  const pageStart = pageEnd - (LIST_ITEMS_PER_PAGE - 1);

  // render batch
  const batchEnd = renderIteration * LIST_ITEMS_PER_BATCH - 1;

  // refetch list when pool list changes
  useEffect(() => {
    if (props.pools !== poolsDefault) {
      setFetched(false);
    }
  }, [props.pools]);

  // configure pool list when network is ready to fetch
  useEffect(() => {
    if (isReady && metrics.activeEra.index !== 0 && !fetched) {
      setupPoolList();
    }
  }, [isReady, fetched, metrics.activeEra.index]);

  // handle pool list bootstrapping
  const setupPoolList = () => {
    setPoolsDefault(props.pools);
    setPools(props.pools);
    setFetched(true);
    fetchPoolsMetaBatch(batchKey, props.pools, true);
  };

  // render throttle
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 500);
    }
  }, [renderIterationRef.current]);

  // get pools to render
  let listPools = [];

  // get throttled subset or entire list
  if (!disableThrottle) {
    listPools = pools.slice(pageStart).slice(0, LIST_ITEMS_PER_PAGE);
  } else {
    listPools = pools;
  }

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    let filteredPools = Object.assign(poolsDefault);
    filteredPools = poolSearchFilter(filteredPools, batchKey, newValue);

    // ensure no duplicates
    filteredPools = filteredPools.filter(
      (value: any, index: any, self: any) =>
        index === self.findIndex((t1: any) => t1.id === value.id)
    );

    setPage(1);
    setRenderIteration(1);
    setPools(filteredPools);
  };

  return (
    <ListWrapper>
      <Header>
        <div>
          <h4>{props.title}</h4>
        </div>
        <div>
          <button type="button" onClick={() => setListFormat('row')}>
            <FontAwesomeIcon
              icon={faBars}
              color={
                listFormat === 'row'
                  ? networkColors[`${network.name}-${mode}`]
                  : 'inherit'
              }
            />
          </button>
          <button type="button" onClick={() => setListFormat('col')}>
            <FontAwesomeIcon
              icon={faGripVertical}
              color={
                listFormat === 'col'
                  ? networkColors[`${network.name}-${mode}`]
                  : 'inherit'
              }
            />
          </button>
        </div>
      </Header>
      <List flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {allowSearch && poolsDefault.length > 0 && (
          <SearchInput
            handleChange={handleSearchChange}
            placeholder={t('library.search')}
          />
        )}
        {pagination && listPools.length > 0 && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}
        <MotionContainer>
          {listPools.length ? (
            <>
              {listPools.map((pool: any, index: number) => {
                // fetch batch data by referring to default list index.
                const batchIndex = poolsDefault.indexOf(pool);

                return (
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
                    <Pool
                      pool={pool}
                      batchKey={batchKey}
                      batchIndex={batchIndex}
                    />
                  </motion.div>
                );
              })}
            </>
          ) : (
            <h4 style={{ padding: '1rem 1rem 0 1rem' }}>
              {isSyncing
                ? t('library.syncing_pool_list')
                : t('library.no_match1')}
            </h4>
          )}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};

export const PoolList = (props: any) => {
  return (
    <PoolListProvider>
      <PoolListShouldUpdate {...props} />
    </PoolListProvider>
  );
};

export class PoolListShouldUpdate extends React.Component<any, any> {
  static contextType = StakingContext;

  shouldComponentUpdate(nextProps: PoolListProps, nextState: any) {
    return this.props.pools !== nextProps.pools;
  }

  render() {
    return <PoolListInner {...this.props} />;
  }
}

export default PoolList;
