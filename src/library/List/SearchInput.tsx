// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

export const SearchInput = ({ handleChange, placeholder }: any) => (
  <div className="search">
    <input
      type="text"
      className="search searchbox"
      placeholder={placeholder}
      onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e)}
    />
  </div>
);
