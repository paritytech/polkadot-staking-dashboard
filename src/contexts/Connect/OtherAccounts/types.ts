// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtensionAccount } from '@polkadot-cloud/react/connect/ExtensionsProvider/types';
import type { MaybeAddress, NetworkName } from 'types';

export interface OtherAccountsContextInterface {
  addExternalAccount: (a: string, addedBy: string) => void;
  addOtherAccounts: (a: ImportedAccount[]) => void;
  renameOtherAccount: (a: MaybeAddress, n: string) => void;
  importLocalOtherAccounts: (g: (n: NetworkName) => ImportedAccount[]) => void;
  forgetOtherAccounts: (a: ImportedAccount[]) => void;
  forgetExternalAccounts: (a: ImportedAccount[]) => void;
  accountsInitialised: boolean;
  otherAccounts: ImportedAccount[];
}

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | LedgerAccount
  | VaultAccount;

export interface ExternalAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  addedBy: string;
}

export interface LedgerAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  index: number;
}

export interface VaultAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  index: number;
}

export interface HandleImportExtension {
  newAccounts: ExtensionAccount[];
  meta: {
    removedActiveAccount: MaybeAddress;
  };
}
