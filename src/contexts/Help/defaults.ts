// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HelpContextInterface } from './types';

export const defaultHelpContext: HelpContextInterface = {
  // eslint-disable-next-line
  openHelpWith: (d, c) => {},
  closeHelp: () => {},
  // eslint-disable-next-line
  setStatus: (s) => {},
  // eslint-disable-next-line
  setDefinition: (d) => {},
  status: 0,
  definition: null,
};
