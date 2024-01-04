// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { makeCancelable } from '@polkadot-cloud/utils';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import { NetworkList } from 'config/networks';
import type { NetworkName } from 'types';
import type { ConnectionType, SubstrateConnect } from './types';

export class APIController {
  // ---------------------
  // Class members.
  // ---------------------

  // The active network.
  static network: NetworkName;

  // API provider.
  static provider: WsProvider | ScProvider;

  // API instance.
  static _api: ApiPromise;

  static get api(): ApiPromise {
    return this._api;
  }

  // Cancel function of substrate connect.
  static cancelFn: () => void;

  // ---------------------
  // Class methods.
  // ---------------------

  // Class initialization. Sets the `provider` and `api` class members.
  static async initialize(
    network: NetworkName,
    type: ConnectionType,
    config: {
      rpcEndpoint: string;
    }
  ) {
    this.network = network;

    if (type === 'ws') {
      this.initWsProvider(network, config.rpcEndpoint);
    } else {
      await this.initScProvider(network);
    }

    this.initEvents();
    this._api = await ApiPromise.create({ provider: this.provider });

    document.dispatchEvent(
      new CustomEvent('polkadot-api', { detail: { event: 'ready' } })
    );
  }

  // Reconnect to a different endpoint.
  static async reconnect(
    network: NetworkName,
    type: ConnectionType,
    rpcEndpoint: string
  ) {
    // Tell UI api is disconnected while we awit disconnect.
    document.dispatchEvent(
      new CustomEvent('polkadot-api', { detail: { event: 'disconnected' } })
    );
    await this.api.disconnect();

    this.network = network;

    document.dispatchEvent(
      new CustomEvent('polkadot-api', { detail: { event: 'connecting' } })
    );
    if (type === 'ws') {
      this.initWsProvider(network, rpcEndpoint);
    } else {
      await this.initScProvider(network);
    }
  }

  // Set up API events. Relays information to `document` for the UI to handle.
  static initEvents() {
    this.provider.on('connected', () => {
      document.dispatchEvent(
        new CustomEvent('polkadot-api', { detail: { event: 'connected' } })
      );
    });
    this.provider.on('disconnected', () => {
      document.dispatchEvent(
        new CustomEvent('polkadot-api', { detail: { event: 'disconnected' } })
      );
    });
    this.provider.on('error', (err) => {
      document.dispatchEvent(
        new CustomEvent('polkadot-api', { detail: { event: 'error', err } })
      );
    });
  }

  // Initiate Websocket Provider
  static initWsProvider(network: NetworkName, rpcEndpoint: string) {
    this.provider = new WsProvider(
      NetworkList[network].endpoints.rpcEndpoints[rpcEndpoint]
    );
  }

  // Dynamically load substrate connect.
  static async initScProvider(network: NetworkName) {
    // Dynamically load substrate connect.
    const ScPromise = makeCancelable(import('@substrate/connect'));
    this.cancelFn = ScPromise.cancel;

    const Sc = (await ScPromise.promise) as SubstrateConnect;

    this.provider = new ScProvider(
      // @ts-expect-error mismatch between `@polkadot/rpc-provider/substrate-connect` and  `@substrate/connect` types: Chain[]' is not assignable to type 'string'.
      Sc,
      NetworkList[network].endpoints.lightClient
    );
  }
}
