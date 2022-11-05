// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { useApi } from 'contexts/Api';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { ImportedAccount } from 'contexts/Connect/types';
import { useEffect, useState } from 'react';
import { planckBnToUnit } from 'Utils';
import { InputItem } from '../Form/types';

export const useEligibleControllers = (): Array<InputItem> => {
  const { network } = useApi();
  const { activeAccount, accounts: connectAccounts } = useConnect();
  const {
    isController,
    existentialAmount,
    getAccountBalance,
    accounts: balanceAccounts,
  } = useBalances();

  const [accounts, setAccounts] = useState<Array<InputItem>>([]);

  useEffect(() => {
    const filterAccounts = () => {
      // remove read only accounts
      let _accounts = connectAccounts.filter((acc: ImportedAccount) => {
        return acc?.source !== 'external';
      });
      // filter items that are already controller accounts
      _accounts = _accounts.filter((acc: ImportedAccount) => {
        return !isController(acc?.address ?? null);
      });

      // remove active account from eligible accounts
      _accounts = _accounts.filter(
        (acc: ImportedAccount) => acc.address !== activeAccount
      );

      // inject balances and whether account can be an active item
      let _accountsAsInput: Array<InputItem> = _accounts.map(
        (acc: ImportedAccount) => {
          const balance = getAccountBalance(acc?.address);
          return {
            ...acc,
            balance,
            active:
              planckBnToUnit(balance.free, network.units) >
              planckBnToUnit(existentialAmount, network.units),
            alert: `Not Enough ${network.unit}`,
          };
        }
      );

      // sort accounts with at least free balance first
      _accountsAsInput = _accountsAsInput.sort((a: InputItem, b: InputItem) => {
        const aFree = a?.balance?.free ?? new BN(0);
        const bFree = b?.balance?.free ?? new BN(0);
        return bFree.sub(aFree).toNumber();
      });

      return _accountsAsInput;
    };

    setAccounts(filterAccounts());
  }, [
    activeAccount,
    connectAccounts,
    balanceAccounts,
    isController,
    getAccountBalance,
    network?.units,
    network?.unit,
    existentialAmount,
  ]);

  return accounts;
};
