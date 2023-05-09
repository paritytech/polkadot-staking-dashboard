// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

export type SubmitTxProps = SubmitProps & {
  buttons?: React.ReactNode[];
  fromController?: boolean;
  proxySupported: boolean;
  noMargin?: boolean;
};

export interface SubmitProps {
  uid?: number;
  onSubmit: () => void;
  submitting: boolean;
  valid: boolean;
  submitText?: string;
}
