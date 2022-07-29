// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import BN from 'bn.js';
import {
  BONDING_DURATION,
  SESSIONS_PER_ERA,
  MAX_NOMINATOR_REWARDED_PER_VALIDATOR,
  MAX_NOMINATIONS,
  API_ENDPOINTS,
  MAX_ELECTING_VOTERS,
  EXPECTED_BLOCK_TIME,
} from 'consts';
import { NETWORKS } from 'config/networks';
import {
  APIContextInterface,
  NetworkState,
  APIConstants,
  ConnectionStatus,
} from 'contexts/Api/types';
import { Network, NetworkName } from 'types';
import * as defaults from './defaults';

export const APIContext = React.createContext<APIContextInterface>(
  defaults.defaultApiContext
);

export const useApi = () => React.useContext(APIContext);

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  // provider instance state
  const [provider, setProvider] = useState<WsProvider | ScProvider | null>(
    null
  );

  // api instance state
  const [api, setApi] = useState<ApiPromise | null>(null);

  // network state
  const _name: NetworkName =
    (localStorage.getItem('network') as NetworkName) ?? NetworkName.Polkadot;

  const [network, setNetwork] = useState<NetworkState>({
    name: _name,
    meta: NETWORKS[localStorage.getItem('network') as NetworkName],
  });

  // constants state
  const [consts, setConsts] = useState<APIConstants>(defaults.consts);

  // connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Disconnected
  );

  const [isLightClient, setIsLightClient] = useState<boolean>(
    !!localStorage.getItem('isLightClient')
  );

  // initial connection
  useEffect(() => {
    const _network: NetworkName = localStorage.getItem(
      'network'
    ) as NetworkName;
    connect(_network, isLightClient);
  }, []);

  // provider event handlers
  useEffect(() => {
    if (provider !== null) {
      provider.on('connected', () => {
        setConnectionStatus(ConnectionStatus.Connected);
      });
      provider.on('error', () => {
        setConnectionStatus(ConnectionStatus.Disconnected);
      });
      connectedCallback(provider);
    }
  }, [provider]);

  // connection callback
  const connectedCallback = async (_provider: WsProvider | ScProvider) => {
    const _api = new ApiPromise({ provider: _provider });
    await _api.isReady;

    localStorage.setItem('network', String(network.name));

    // constants
    const promises = [
      _api.consts.staking.bondingDuration,
      _api.consts.staking.maxNominations,
      _api.consts.staking.sessionsPerEra,
      _api.consts.staking.maxNominatorRewardedPerValidator,
      _api.consts.electionProviderMultiPhase.maxElectingVoters,
      _api.consts.babe.expectedBlockTime,
      _api.consts.balances.existentialDeposit,
    ];

    // pools constants
    if (network.meta.features.pools) {
      promises.push(_api.consts.nominationPools.palletId);
    }

    // fetch constants
    const _consts = await Promise.all(promises);

    // format constants
    const bondDuration = _consts[0]
      ? Number(_consts[0].toString())
      : BONDING_DURATION;

    const maxNominations = _consts[1]
      ? Number(_consts[1].toString())
      : MAX_NOMINATIONS;

    const sessionsPerEra = _consts[2]
      ? Number(_consts[2].toString())
      : SESSIONS_PER_ERA;

    const maxNominatorRewardedPerValidator = _consts[3]
      ? Number(_consts[3].toString())
      : MAX_NOMINATOR_REWARDED_PER_VALIDATOR;

    const maxElectingVoters = _consts[4]
      ? Number(_consts[4].toString())
      : MAX_ELECTING_VOTERS;

    const expectedBlockTime = _consts[5]
      ? Number(_consts[5].toString())
      : EXPECTED_BLOCK_TIME;

    const existentialDeposit = _consts[6]
      ? new BN(_consts[6].toString())
      : new BN(0);

    const poolsPalletId = _consts[7] ? _consts[7].toU8a() : new Uint8Array(0);

    setApi(_api);
    setConsts({
      bondDuration,
      maxNominations,
      sessionsPerEra,
      maxNominatorRewardedPerValidator,
      maxElectingVoters,
      expectedBlockTime,
      poolsPalletId,
      existentialDeposit,
    });
  };

  // connect function sets provider and updates active network.
  const connect = async (_network: NetworkName, _isLightClient?: boolean) => {
    const nodeEndpoint: Network = NETWORKS[_network];
    let _provider: WsProvider | ScProvider;
    if (_isLightClient && nodeEndpoint.lightClientEndpoint) {
      _provider = new ScProvider(nodeEndpoint.lightClientEndpoint);
      await _provider.connect();
    } else {
      _provider = new WsProvider(nodeEndpoint.endpoint);
    }
    setNetwork({
      name: _network,
      meta: NETWORKS[_network],
    });
    setProvider(_provider);
  };

  // handle network switching
  const switchNetwork = async (
    _network: NetworkName,
    _isLightClient: boolean
  ) => {
    if (api !== null) {
      localStorage.setItem('isLightClient', _isLightClient ? 'true' : '');
      setIsLightClient(_isLightClient);
      await api.disconnect();
      setApi(null);
      setConnectionStatus(ConnectionStatus.Connecting);
      connect(_network, _isLightClient);
    }
  };

  // handles fetching of DOT price and updates context state.
  const fetchDotPrice = async () => {
    const urls = [
      `${API_ENDPOINTS.priceChange}${NETWORKS[network.name].api.priceTicker}`,
    ];
    const responses = await Promise.all(
      urls.map((u) => fetch(u, { method: 'GET' }))
    );
    const texts = await Promise.all(responses.map((res) => res.json()));
    const _change = texts[0];

    if (
      _change.lastPrice !== undefined &&
      _change.priceChangePercent !== undefined
    ) {
      const price: string = (Math.ceil(_change.lastPrice * 100) / 100).toFixed(
        2
      );
      const change: string = (
        Math.round(_change.priceChangePercent * 100) / 100
      ).toFixed(2);

      return {
        lastPrice: price,
        change,
      };
    }
    return null;
  };

  return (
    <APIContext.Provider
      value={{
        connect,
        fetchDotPrice,
        switchNetwork,
        api,
        consts,
        isReady:
          connectionStatus === ConnectionStatus.Connected && api !== null,
        network: network.meta,
        status: connectionStatus,
        isLightClient,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};
