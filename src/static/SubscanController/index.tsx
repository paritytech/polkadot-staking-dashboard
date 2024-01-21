// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from 'types';

// A class to manage Subscan API Calls.
//
// TODO: Implement timeouts to not call more than 5 requests in 1 second.
//
// TODO: Handle caching of results in local storage, key by era and refresh if outdated.
export class SubscanController {
  // ------------------------------------------------------
  // Class members.
  // ------------------------------------------------------

  // Public Subscan API Key.
  static API_KEY = 'd37149339f64775155a82a53f4253b27';

  // Total amount of requests that can be made in 1 second.
  static TOTAL_REQUESTS_PER_SECOND = 5;

  // The network to use for Subscan API calls.
  static network: string;

  // List of endpoints to be used for Subscan API calls.
  static endpoints = {
    eraStat: '/api/scan/staking/era_stat',
    poolDetails: '/api/scan/nomination_pool/pool',
    poolMembers: '/api/scan/nomination_pool/pool/members',
    poolRewards: '/api/scan/nomination_pool/rewards',
    rewardSlash: '/api/v2/scan/account/reward_slash',
  };

  // The timestamp of the last 5 requests made.
  static _lastRequestTimes = [];

  // ------------------------------------------------------
  // Setters.
  // ------------------------------------------------------

  // Set the network to use for Subscan API calls.
  //
  // Effects the endpoint being used. Should be updated on network change in the UI.
  set network(network: string) {
    SubscanController.network = network;
  }

  // ------------------------------------------------------
  // Handling requests.
  // ------------------------------------------------------

  // Fetch nominator payouts from Subscan. NOTE: Payouts with a `block_timestamp` of 0 are
  // unclaimed.
  static fetchNominatorPayouts = async (address: string): Promise<AnyJson> => {
    const result: AnyJson = await this.makeRequest(this.endpoints.rewardSlash, {
      address,
      is_stash: true,
    });
    // TODO: check if result was successful before accessing list. SubscanResult<T>.
    if (!result?.data?.list) {
      return { claimedPayouts: [], unclaimedPayouts: [] };
    }
    const claimedPayouts = result.data.list.filter(
      (l: AnyJson) => l.block_timestamp !== 0
    );
    const unclaimedPayouts = result.data.list.filter(
      (l: AnyJson) => l.block_timestamp === 0
    );
    return { claimedPayouts, unclaimedPayouts };
  };

  // Fetch pool claims from Subscan, ensuring no payouts have block_timestamp of 0.
  static fetchPoolClaims = async (address: string): Promise<AnyJson> => {
    const result: AnyJson = await this.makeRequest(this.endpoints.poolRewards, {
      address,
    });
    // TODO: check if result was successful before accessing list. SubscanResult<T>
    const poolClaims = result.data.list.filter(
      (l: AnyJson) => l.block_timestamp !== 0
    );
    return poolClaims;
  };

  // ------------------------------------------------------
  // Handling multiple requests concurrently.
  // ------------------------------------------------------

  // Handle fetching the various types of payout and set state in one render.
  static handleFetchPayouts = async (address: string) => {
    const results = await Promise.all([
      this.fetchNominatorPayouts(address),
      this.fetchPoolClaims(address),
    ]);
    const { claimedPayouts, unclaimedPayouts } = results[0];
    const poolClaims = results[1];

    // TODO: send these payouts back to UI and set to state if subscan is still enabled.
    return {
      claimedPayouts,
      unclaimedPayouts,
      poolClaims,
    };
  };

  // ------------------------------------------------------
  // Helpers for making requests.
  // ------------------------------------------------------

  // Get the public Subscan endpoint.
  static getEndpoint = () => `https://${this.network}.api.subscan.io`;

  // Make a request to Subscan and return any data returned from the response.
  static makeRequest = async (endpoint: string, body: AnyJson) => {
    const res: Response = await fetch(this.getEndpoint() + endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.API_KEY,
      },
      body: JSON.stringify(body),
      method: 'POST',
    });
    const json = await res.json();
    return json?.data || undefined;
  };
}
