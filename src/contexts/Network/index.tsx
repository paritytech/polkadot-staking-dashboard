// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN } from 'bn.js';
import React, { useEffect, useState } from 'react';
import { AnyApi } from 'types';
import { useApi } from '../Api';
import * as defaults from './defaults';
import { NetworkMetrics, NetworkMetricsContextInterface } from './types';

export const NetworkMetricsContext =
  React.createContext<NetworkMetricsContextInterface>(
    defaults.defaultNetworkContext
  );

export const useNetworkMetrics = () => React.useContext(NetworkMetricsContext);

export const NetworkMetricsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isReady, api, status } = useApi();

  useEffect(() => {
    if (status === 'connecting') {
      setMetrics(defaults.metrics);
    }
  }, [status]);

  // store network metrics in state
  const [metrics, setMetrics] = useState<NetworkMetrics>(defaults.metrics);

  // store network metrics unsubscribe
  const [unsub, setUnsub] = useState<AnyApi>(undefined);

  // manage unsubscribe
  useEffect(() => {
    // active subscription
    const subscribeToNetworkMetrics = async () => {
      if (!api) return;

      if (isReady) {
        const _unsub = await api.queryMulti(
          [
            api.query.staking.activeEra,
            api.query.balances.totalIssuance,
            api.query.auctions.auctionCounter,
            api.query.paraSessionInfo.earliestStoredSession,
          ],
          ([
            activeEra,
            _totalIssuance,
            _auctionCounter,
            _earliestStoredSession,
          ]: AnyApi) => {
            // determine activeEra: toString used as alternative to `toHuman`, that puts commas in numbers
            let _activeEra = activeEra
              .unwrapOrDefault({
                index: 0,
                start: 0,
              })
              .toString();

            // convert JSON string to object
            _activeEra = JSON.parse(_activeEra);

            const _metrics = {
              activeEra: _activeEra,
              totalIssuance: _totalIssuance.toBn(),
              auctionCounter: new BN(_auctionCounter.toString()),
              earliestStoredSession: new BN(_earliestStoredSession.toString()),
            };
            setMetrics(_metrics);
          }
        );
        setUnsub(_unsub);
      }
    };

    subscribeToNetworkMetrics();
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [api, isReady, unsub]);

  return (
    <NetworkMetricsContext.Provider
      value={{
        metrics: {
          activeEra: metrics.activeEra,
          totalIssuance: metrics.totalIssuance,
          auctionCounter: metrics.auctionCounter,
          earliestStoredSession: metrics.earliestStoredSession,
        },
      }}
    >
      {children}
    </NetworkMetricsContext.Provider>
  );
};
