// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FormEvent } from 'react';
import { SearchInputWrapper } from '.';
import type { SearchInputProps } from './types';

export const SearchInput = ({
  value,
  handleChange,
  placeholder,
}: SearchInputProps) => (
  <SearchInputWrapper>
    <input
      type="text"
      value={value}
      className="search"
      placeholder={placeholder}
      onChange={(e: FormEvent<HTMLInputElement>) => handleChange(e)}
    />
  </SearchInputWrapper>
);
