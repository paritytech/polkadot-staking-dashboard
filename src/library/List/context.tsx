// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from 'react';
import * as defaults from './defaults';
import type { AnyJson } from 'types';
import type { ListContextInterface, ListProviderProps } from './types';

export const ListContext: React.Context<ListContextInterface> =
  React.createContext(defaults.defaultContext);

export const useList = () => React.useContext(ListContext);

export const ListProvider = ({
  selectToggleable = true,
  selectActive: initialSelctActive = false,
  children,
}: ListProviderProps) => {
  // Store the currently selected validators from the list.
  const [selected, setSelected] = useState<AnyJson[]>([]);

  // Store whether validator selection is active.
  const [selectActive, setSelectActiveState] = useState<boolean>(
    initialSelctActive ?? false
  );

  // Store the list format of the list.
  const [listFormat, _setListFormat] = useState<'col' | 'row'>('col');

  const addToSelected = (_item: AnyJson) => {
    setSelected([...selected].concat(_item));
  };

  const removeFromSelected = (items: AnyJson[]) => {
    setSelected([...selected].filter((item) => !items.includes(item)));
  };

  const resetSelected = () => {
    setSelected([]);
  };

  const setSelectActive = (_selectActive: boolean) => {
    setSelectActiveState(_selectActive);
    if (_selectActive === false) {
      resetSelected();
    }
  };

  const setListFormat = (v: 'col' | 'row') => {
    _setListFormat(v);
  };

  return (
    <ListContext.Provider
      value={{
        setSelectActive,
        addToSelected,
        removeFromSelected,
        resetSelected,
        setListFormat,
        selected,
        selectActive,
        listFormat,
        selectToggleable,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
