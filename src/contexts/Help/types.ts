// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactNode } from 'react';
import { MaybeString } from 'types';

export type HelpItems = Array<HelpItem>;

export interface HelpItem {
  key?: string;
  definitions?: Array<string>;
  external?: ExternalItems;
}

export type ExternalItems = Array<ExternalItem>;
export type ExternalItem = [string, string, string];

export type DefinitionWithKeys = {
  title: string;
  description: string[];
};

export interface ExternalWithKeys {
  title: string;
  url: string;
  website?: string;
}

export interface HelpContextInterface {
  openHelpWith: (d: MaybeString, c: HelpConfig) => void;
  closeHelp: () => void;
  setStatus: (s: number) => void;
  setDefinition: (d: MaybeString) => void;
  status: number;
  definition: MaybeString;
}

export interface HelpContextState {
  status: number;
  definition: MaybeString;
  config: HelpConfig;
}

export interface HelpContextProps {
  children: ReactNode;
}

export type HelpConfig = Record<string, string | any>;
