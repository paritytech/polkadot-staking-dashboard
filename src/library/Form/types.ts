// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { Balance } from 'contexts/Balances/types';
import { ExternalAccount } from 'contexts/Connect/types';
import { ExtensionAccount } from 'contexts/Extensions/types';
import { BondFor } from 'types';

export interface ExtensionAccountItem extends ExtensionAccount {
  active?: boolean;
  alert?: string;
  balance?: Balance;
}
export interface ExternalAccountItem extends ExternalAccount {
  active?: boolean;
  alert?: string;
  balance?: Balance;
}
export type ImportedAccountItem = ExtensionAccountItem | ExternalAccountItem;

export type InputItem = ImportedAccountItem | null;

export interface DropdownInput {
  key: string;
  name: string;
}

export interface AccountDropdownProps {
  items: Array<InputItem>;
  onChange: (o: any) => void;
  placeholder: string;
  value: InputItem;
  current: InputItem;
  height: string | number | undefined;
}

export interface AccountSelectProps {
  items: Array<InputItem>;
  onChange: (o: any) => void;
  placeholder: string;
  value: InputItem;
}

export interface BondFeedbackProps {
  syncing?: boolean;
  setters: any;
  bondFor: BondFor;
  defaultBond: number | null;
  inSetup?: boolean;
  listenIsValid: { (v: boolean): void } | { (): void };
  warnings?: string[];
  disableTxFeeUpdate?: boolean;
  setLocalResize?: () => void;
  txFees: BN;
  maxWidth?: boolean;
}

export interface BondInputProps {
  freeBalance: number;
  value: string;
  defaultValue: string;
  syncing?: boolean;
  setters: any;
  disabled: boolean;
  disableTxFeeUpdate?: boolean;
}

export interface UnbondFeedbackProps {
  setters: any;
  bondFor: BondFor;
  defaultBond?: number;
  inSetup?: boolean;
  listenIsValid: { (v: boolean): void } | { (): void };
  warnings?: string[];
  setLocalResize?: () => void;
  txFees: BN;
}

export interface UnbondInputProps {
  active: BN;
  unbondToMin: BN;
  defaultValue: number | string;
  disabled: boolean;
  setters: any;
  value: any;
}

export interface NominateStatusBarProps {
  value: number;
}

export interface DropdownProps {
  items: Array<DropdownInput>;
  onChange: (o: any) => void;
  label?: string;
  placeholder: string;
  value: DropdownInput;
  current: DropdownInput;
  height: string;
}

export interface WarningProps {
  text: string;
}
