// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FunctionComponent, SVGProps } from 'react';
import type { WellKnownChain } from '@polkadot/rpc-provider/substrate-connect';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { PageProps } from 'pages/types';

export type Fn = () => void;

export enum NetworkName {
  Polkadot = 'polkadot',
  Westend = 'westend',
}

export enum Toggle {
  Open = 'open',
  Closed = 'closed',
}

export interface Networks {
  [key: string]: Network;
}

export interface Network {
  name: string;
  colors: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    };
    transparent: {
      light: string;
      dark: string;
    };
  };
  endpoint: string;
  lightClientEndpoint?: WellKnownChain;
  subscanEndpoint: string;
  unit: string;
  units: number;
  ss58: number;
  brand: {
    icon: FunctionComponent<
      SVGProps<SVGSVGElement> & { title?: string | undefined }
    >;
    logo: {
      svg: FunctionComponent<
        SVGProps<SVGSVGElement> & { title?: string | undefined }
      >;
      width: string;
    };
    inline: {
      svg: FunctionComponent<
        SVGProps<SVGSVGElement> & { title?: string | undefined }
      >;
      size: string;
    };
  };
  api: {
    unit: string;
    priceTicker: string;
  };
  features: {
    pools: boolean;
  };
  params: { [key: string]: number };
}

export type PageCategories = Array<{
  _id: number;
  title: string;
}>;

export type PagesConfig = Array<{
  category: number;
  title: string;
  uri: string;
  hash: string;
  Entry: React.FC<PageProps>;
  icon: IconDefinition;
}>;

export type MaybeAccount = string | null;

// any types to compress compiler warnings
// eslint-disable-next-line
export type AnyApi = any;
// eslint-disable-next-line
export type AnyMetaBatch = any;
// eslint-disable-next-line
export type AnySubscan = any;
