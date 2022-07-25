// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { List, Header, Wrapper as ListWrapper, Pagination } from 'library/List';
import { useApi } from 'contexts/Api';
import { StakingContext } from 'contexts/Staking';
import { useNetworkMetrics } from 'contexts/Network';
import { LIST_ITEMS_PER_PAGE, LIST_ITEMS_PER_BATCH } from 'consts';
import { planckToUnit } from 'Utils';
import { networkColors } from 'theme/default';
import { useTheme } from 'contexts/Themes';
import { AnySubscan } from 'types';
import { usePayoutList, PayoutListProvider } from './context';
import { ItemWrapper } from '../Wrappers';
import { PayoutListProps } from '../types';

export const PayoutListInner = (props: PayoutListProps) => {
  const { allowMoreCols, pagination } = props;

  const { mode } = useTheme();
  const { isReady, network } = useApi();
  const { units } = network;
  const { metrics } = useNetworkMetrics();
  const { listFormat, setListFormat } = usePayoutList();

  const disableThrottle = props.disableThrottle ?? false;

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, _setRenderIteration] = useState<number>(1);

  // manipulated list (ordering, filtering) of payouts
  const [payouts, setPayouts] = useState<any>(props.payouts);

  // is this the initial fetch
  const [fetched, setFetched] = useState<boolean>(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    _setRenderIteration(iter);
  };

  // pagination
  const totalPages = Math.ceil(payouts.length / LIST_ITEMS_PER_PAGE);
  const nextPage = page + 1 > totalPages ? totalPages : page + 1;
  const prevPage = page - 1 < 1 ? 1 : page - 1;
  const pageEnd = page * LIST_ITEMS_PER_PAGE - 1;
  const pageStart = pageEnd - (LIST_ITEMS_PER_PAGE - 1);

  // render batch
  const batchEnd = renderIteration * LIST_ITEMS_PER_BATCH - 1;

  // refetch list when list changes
  useEffect(() => {
    setFetched(false);
  }, [props.payouts]);

  // configure list when network is ready to fetch
  useEffect(() => {
    if (isReady && metrics.activeEra.index !== 0 && !fetched) {
      setPayouts(props.payouts);
      setFetched(true);
    }
  }, [isReady, fetched, metrics.activeEra.index]);

  // render throttle
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 500);
    }
  }, [renderIterationRef.current]);

  // get list items to render
  let listPayouts = [];

  // get throttled subset or entire list
  if (!disableThrottle) {
    listPayouts = payouts.slice(pageStart).slice(0, LIST_ITEMS_PER_PAGE);
  } else {
    listPayouts = payouts;
  }

  if (!payouts.length) {
    return <></>;
  }

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
        {pagination && (
          <Pagination prev={page !== 1} next={page !== totalPages}>
            <div>
              <h4>
                Page {page} of {totalPages}
              </h4>
            </div>
            <div>
              <button
                type="button"
                className="prev"
                onClick={() => {
                  setPage(prevPage);
                }}
              >
                Prev
              </button>
              <button
                type="button"
                className="next"
                onClick={() => {
                  setPage(nextPage);
                }}
              >
                Next
              </button>
            </div>
          </Pagination>
        )}

        <motion.div
          className="transition"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.01,
              },
            },
          }}
        >
          {listPayouts.map((payout: AnySubscan, index: number) => {
            const { amount, block_timestamp, event_id } = payout;
            const label = event_id === 'PaidOut' ? 'Pool Claim' : event_id;
            const labelClass =
              event_id === 'PaidOut'
                ? 'claim'
                : event_id === 'Reward'
                ? 'reward'
                : undefined;

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
                <ItemWrapper>
                  <div>
                    <div>
                      <span className={labelClass}>
                        <h4>{label}</h4>
                      </span>
                      <h4 className={labelClass}>
                        {event_id === 'Slash' ? '-' : '+'}
                        {planckToUnit(amount, units)} {network.unit}
                      </h4>
                    </div>
                    <div>
                      <h4>{moment.unix(block_timestamp).fromNow()}</h4>
                    </div>
                  </div>
                </ItemWrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </List>
    </ListWrapper>
  );
};

export const PayoutList = (props: PayoutListProps) => {
  return (
    <PayoutListProvider>
      <PayoutListShouldUpdate {...props} />
    </PayoutListProvider>
  );
};

export class PayoutListShouldUpdate extends React.Component<any, any> {
  static contextType = StakingContext;

  render() {
    return <PayoutListInner {...this.props} />;
  }
}

export default PayoutList;
