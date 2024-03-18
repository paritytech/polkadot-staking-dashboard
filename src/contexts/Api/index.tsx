// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  NetworkList,
  NetworksWithPagedRewards,
  PagedRewardsStartEra,
} from 'config/networks';

import type {
  APIActiveEra,
  APIChainState,
  APIConstants,
  APIContextInterface,
  APINetworkMetrics,
  APIPoolsConfig,
  APIProviderProps,
  APIStakingMetrics,
} from './types';
import { useEffectIgnoreInitial } from '@w3ux/hooks';
import {
  defaultConsts,
  defaultActiveEra,
  defaultApiContext,
  defaultChainState,
  defaultPoolsConfig,
  defaultNetworkMetrics,
  defaultStakingMetrics,
} from './defaults';
import { isCustomEvent } from 'controllers/utils';
import { useEventListener } from 'usehooks-ts';
import BigNumber from 'bignumber.js';
import { SyncController } from 'controllers/SyncController';
import { ApiController } from 'controllers/ApiController';
import type { ApiStatus, ConnectionType } from 'model/Api/types';

export const APIContext = createContext<APIContextInterface>(defaultApiContext);

export const useApi = () => useContext(APIContext);

export const APIProvider = ({ children, network }: APIProviderProps) => {
  // Store Api connection status for the current network.
  const [apiStatus, setApiStatus] = useState<ApiStatus>('disconnected');

  // Store whether light client is active.
  const [connectionType, setConnectionTypeState] = useState<ConnectionType>(
    localStorage.getItem('light_client') ? 'sc' : 'ws'
  );
  const connectionTypeRef = useRef(connectionType);

  // Whether this context has initialised.
  const initialisedRef = useRef<boolean>(false);

  // Setter for whether light client is active. Updates state and local storage.
  const setConnectionType = (value: ConnectionType) => {
    connectionTypeRef.current = value;
    setConnectionTypeState(value);

    if (value === 'ws') {
      localStorage.removeItem('light_client');
      return;
    }
    localStorage.setItem('light_client', 'true');
  };

  // Store the active RPC provider.
  const initialRpcEndpoint = () => {
    const local = localStorage.getItem(`${network}_rpc_endpoint`);
    if (local) {
      if (NetworkList[network].endpoints.rpcEndpoints[local]) {
        return local;
      } else {
        localStorage.removeItem(`${network}_rpc_endpoint`);
      }
    }
    return NetworkList[network].endpoints.defaultRpcEndpoint;
  };

  // The current RPC endpoint for the network.
  const [rpcEndpoint, setRpcEndpointState] =
    useState<string>(initialRpcEndpoint());
  const rpcEndpointRef = useRef(rpcEndpoint);

  // Set RPC provider with local storage and validity checks.
  const setRpcEndpoint = (key: string) => {
    if (!NetworkList[network].endpoints.rpcEndpoints[key]) {
      return;
    }
    localStorage.setItem(`${network}_rpc_endpoint`, key);
    rpcEndpointRef.current = key;
    setRpcEndpointState(key);
  };

  // Store chain state.
  const [chainState, setChainState] =
    useState<APIChainState>(defaultChainState);

  // Store network constants.
  const [consts, setConsts] = useState<APIConstants>(defaultConsts);

  // Store network metrics in state.
  const [networkMetrics, setNetworkMetrics] = useState<APINetworkMetrics>(
    defaultNetworkMetrics
  );
  const networkMetricsRef = useRef(networkMetrics);

  // Store active era in state.
  const [activeEra, setActiveEra] = useState<APIActiveEra>(defaultActiveEra);
  const activeEraRef = useRef(activeEra);

  // Store pool config in state.
  const [poolsConfig, setPoolsConfig] =
    useState<APIPoolsConfig>(defaultPoolsConfig);
  const poolsConfigRef = useRef(poolsConfig);

  // Store staking metrics in state.
  const [stakingMetrics, setStakingMetrics] = useState<APIStakingMetrics>(
    defaultStakingMetrics
  );
  const stakingMetricsRef = useRef(stakingMetrics);

  // Fetch chain state. Called once `provider` has been initialised.
  const onApiReady = async () => {
    const { api } = ApiController.get(network);

    const newChainState = await Promise.all([
      api.rpc.system.chain(),
      api.consts.system.version,
      api.consts.system.ss58Prefix,
    ]);

    // Check that chain values have been fetched before committing to state. Could be expanded to
    // check supported chains.
    if (newChainState.every((c) => !!c?.toHuman())) {
      const chain = newChainState[0]?.toString();
      const version = newChainState[1]?.toJSON();
      const ss58Prefix = Number(newChainState[2]?.toString());
      setChainState({ chain, version, ss58Prefix });
    }

    // Assume chain state is correct and bootstrap network consts.
    bootstrapNetworkConfig();
  };

  // Bootstrap app-wide chain state.
  const bootstrapNetworkConfig = async () => {
    const apiInstance = ApiController.get(network);

    const {
      consts: newConsts,
      networkMetrics: newNetworkMetrics,
      activeEra: newActiveEra,
      poolsConfig: newPoolsConfig,
      stakingMetrics: newStakingMetrics,
    } = await apiInstance.bootstrapNetworkConfig();

    // Populate all config state.
    setConsts(newConsts);
    setStateWithRef(newNetworkMetrics, setNetworkMetrics, networkMetricsRef);
    const { index, start } = newActiveEra;
    setStateWithRef(
      { index: new BigNumber(index), start: new BigNumber(start) },
      setActiveEra,
      activeEraRef
    );
    setStateWithRef(newPoolsConfig, setPoolsConfig, poolsConfigRef);
    setStateWithRef(newStakingMetrics, setStakingMetrics, stakingMetricsRef);

    // API is now ready to be used.
    setApiStatus('ready');

    // Set `initialization` syncing to complete.
    SyncController.dispatch('initialization', 'complete');

    // Initialise subscriptions.
    apiInstance.subscribeBlockNumber();
    apiInstance.subscribeNetworkMetrics();
    apiInstance.subscribePoolsConfig();
    apiInstance.subscribeActiveEra();
  };

  // Handle Api disconnection.
  const onApiDisconnected = () => {
    setApiStatus('disconnected');
  };

  // Handle `polkadot-api` events.
  const handleNewApiStatus = (e: Event) => {
    if (isCustomEvent(e)) {
      const {
        status,
        network: eventNetwork,
        type,
        rpcEndpoint: eventRpcEndpoints,
      } = e.detail;

      // UI is only interested in events for the current network.
      if (
        eventNetwork !== network ||
        connectionTypeRef.current !== type ||
        rpcEndpointRef.current !== eventRpcEndpoints
      ) {
        return;
      }

      switch (status) {
        case 'ready':
          onApiReady();
          break;
        case 'connecting':
          setApiStatus('connecting');
          break;
        case 'connected':
          setApiStatus('connected');
          break;
        case 'disconnected':
          onApiDisconnected();
          break;
        case 'error':
          // Reinitialise api on error. We can confidently do this with well-known RPC providers,
          // but not with custom endpoints.
          reInitialiseApi(connectionType);
          break;
      }
    }
  };

  // Handle new network metrics updates.
  const handleNetworkMetricsUpdate = (e: Event): void => {
    if (isCustomEvent(e)) {
      const { networkMetrics: newNetworkMetrics } = e.detail;
      // Only update if values have changed.
      if (
        JSON.stringify(newNetworkMetrics) !==
        JSON.stringify(networkMetricsRef.current)
      ) {
        setStateWithRef(
          {
            ...networkMetricsRef.current,
            ...newNetworkMetrics,
          },
          setNetworkMetrics,
          networkMetricsRef
        );
      }
    }
  };

  // Handle new active era updates.
  const handleActiveEraUpdate = (e: Event): void => {
    if (isCustomEvent(e)) {
      let { activeEra: newActiveEra } = e.detail;
      const { index, start } = newActiveEra;

      newActiveEra = {
        index: new BigNumber(index),
        start: new BigNumber(start),
      };

      // Only update if values have changed.
      if (
        JSON.stringify(newActiveEra) !== JSON.stringify(activeEraRef.current)
      ) {
        setStateWithRef(
          {
            index: new BigNumber(index),
            start: new BigNumber(start),
          },
          setActiveEra,
          activeEraRef
        );
      }
    }
  };

  // Handle new pools config updates.
  const handlePoolsConfigUpdate = (e: Event): void => {
    if (isCustomEvent(e)) {
      const { poolsConfig: newPoolsConfig } = e.detail;
      // Only update if values have changed.
      if (
        JSON.stringify(newPoolsConfig) !==
        JSON.stringify(poolsConfigRef.current)
      ) {
        setStateWithRef(
          {
            ...poolsConfigRef.current,
            ...newPoolsConfig,
          },
          setPoolsConfig,
          poolsConfigRef
        );
      }
    }
  };

  // Handle new staking metrics updates.
  const handleStakingMetricsUpdate = (e: Event): void => {
    if (isCustomEvent(e)) {
      const { stakingMetrics: newStakingMetrics } = e.detail;
      // Only update if values have changed.
      if (
        JSON.stringify(newStakingMetrics) !==
        JSON.stringify(stakingMetricsRef.current)
      ) {
        setStateWithRef(
          {
            ...stakingMetricsRef.current,
            ...newStakingMetrics,
          },
          setStakingMetrics,
          stakingMetricsRef
        );
      }
    }
  };

  // Given an era, determine whether paged rewards are active.
  const isPagedRewardsActive = (era: BigNumber): boolean => {
    const networkStartEra = PagedRewardsStartEra[network];
    if (!networkStartEra) {
      return false;
    }
    return (
      NetworksWithPagedRewards.includes(network) &&
      era.isGreaterThanOrEqualTo(networkStartEra)
    );
  };

  const reInitialiseApi = async (type: ConnectionType) => {
    setApiStatus('disconnected');
    await ApiController.instantiate(network, type, rpcEndpoint);
  };

  // Handle initial api connection.
  useEffect(() => {
    // Uses initialisation ref to check whether this is the first context render, and initializes an Api instance for the current network if that is the case.
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      reInitialiseApi(connectionType);
    }
  });

  // If RPC endpoint changes, and not on light client, re-initialise API.
  useEffectIgnoreInitial(async () => {
    if (connectionType !== 'sc') {
      reInitialiseApi('ws');
    }
  }, [rpcEndpoint]);

  // If connection type changes, re-initialise API.
  useEffectIgnoreInitial(async () => {
    reInitialiseApi(connectionType);
  }, [connectionType]);

  // Re-initialise API and set defaults on network change.
  useEffectIgnoreInitial(() => {
    setRpcEndpoint(initialRpcEndpoint());

    // Reset consts and chain state.
    setConsts(defaultConsts);
    setChainState(defaultChainState);
    setStateWithRef(
      defaultNetworkMetrics,
      setNetworkMetrics,
      networkMetricsRef
    );
    setStateWithRef(defaultActiveEra, setActiveEra, activeEraRef);
    setStateWithRef(defaultPoolsConfig, setPoolsConfig, poolsConfigRef);
    setStateWithRef(
      defaultStakingMetrics,
      setStakingMetrics,
      stakingMetricsRef
    );

    reInitialiseApi(connectionType);
  }, [network]);

  // Call `unsubscribe` on active instnace on unmount.
  useEffect(
    () => () => {
      const instance = ApiController.get(network);
      instance?.unsubscribe();
    },
    []
  );

  // Add event listener for api events and subscription updates.
  const documentRef = useRef<Document>(document);
  useEventListener('api-status', handleNewApiStatus, documentRef);
  useEventListener(
    'new-network-metrics',
    handleNetworkMetricsUpdate,
    documentRef
  );
  useEventListener('new-active-era', handleActiveEraUpdate, documentRef);
  useEventListener('new-pools-config', handlePoolsConfigUpdate, documentRef);
  useEventListener(
    'new-staking-metrics',
    handleStakingMetricsUpdate,
    documentRef
  );

  return (
    <APIContext.Provider
      value={{
        api: ApiController.get(network)?.api || null,
        chainState,
        apiStatus,
        connectionType,
        setConnectionType,
        rpcEndpoint,
        setRpcEndpoint,
        isReady: apiStatus === 'ready',
        consts,
        networkMetrics,
        activeEra,
        poolsConfig,
        stakingMetrics,
        isPagedRewardsActive,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};
