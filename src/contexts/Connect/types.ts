// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ExtensionAccount,
  ExtensionInjected,
} from '@polkadot-cloud/react/connect/ExtensionsProvider/types';
import type { MaybeAccount, NetworkName } from 'types';

export interface ConnectContextInterface {
  formatAccountSs58: (a: string) => string | null;
  connectExtensionAccounts: (e: ExtensionInjected) => Promise<boolean>;
  getAccount: (account: MaybeAccount) => ExtensionAccount | null;
  connectToAccount: (a: ImportedAccount | null) => void;
  disconnectFromAccount: () => void;
  addExternalAccount: (a: string, addedBy: string) => void;
  accountHasSigner: (a: MaybeAccount) => boolean;
  requiresManualSign: (a: MaybeAccount) => boolean;
  isReadOnlyAccount: (a: MaybeAccount) => boolean;
  addToAccounts: (a: ImportedAccount[]) => void;
  forgetAccounts: (a: ImportedAccount[]) => void;
  renameImportedAccount: (a: MaybeAccount, n: string) => void;
  importLocalAccounts: (g: (n: NetworkName) => ImportedAccount[]) => void;
  accounts: ExtensionAccount[];
}

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | LedgerAccount;

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
    removedActiveAccount: MaybeAccount;
  };
}

export type ActiveProxy = {
  address: MaybeAccount;
  proxyType: string;
} | null;
