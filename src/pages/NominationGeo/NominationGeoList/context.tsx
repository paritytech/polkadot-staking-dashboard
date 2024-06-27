// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { NominationGeoListContextInterface } from '../types';
import type { ListFormat } from 'library/PoolList/types';

export const NominationGeoListContext =
  createContext<NominationGeoListContextInterface>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    setListFormat: (v: ListFormat) => {},
    listFormat: 'col',
  });

export const useNominationGeoList = () => useContext(NominationGeoListContext);

export const NominationGeoListProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [listFormat, _setListFormat] = useState<ListFormat>('col');

  const setListFormat = (v: ListFormat) => {
    _setListFormat(v);
  };

  return (
    <NominationGeoListContext.Provider
      value={{
        setListFormat,
        listFormat,
      }}
    >
      {children}
    </NominationGeoListContext.Provider>
  );
};
