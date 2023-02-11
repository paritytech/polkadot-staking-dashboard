// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

export const PoolListContext: React.Context<any> = React.createContext({
  // eslint-disable-next-line
  setListFormat: (v: string) => {},
  listFormat: 'col',
});

export const usePoolList = () => React.useContext(PoolListContext);

export const PoolListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [listFormat, _setListFormat] = useState('col');

  const setListFormat = (v: string) => {
    _setListFormat(v);
  };

  return (
    <PoolListContext.Provider
      value={{
        setListFormat,
        listFormat,
      }}
    >
      {children}
    </PoolListContext.Provider>
  );
};
