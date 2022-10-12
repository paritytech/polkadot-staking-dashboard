// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { isNumeric } from 'Utils';
import { Button } from 'library/Button';
import { useTranslation } from 'react-i18next';
import { InputWrapper, RowWrapper } from '../Wrappers';
import { UnbondInputProps } from '../types';

export const UnbondInput = (props: UnbondInputProps) => {
  const { network } = useApi();
  const { activeAccount } = useConnect();
  const { t } = useTranslation('common');

  const { disabled, freeToUnbondToMin } = props;
  const setters = props.setters ?? [];
  const _value = props.value ?? 0;
  const defaultValue = props.defaultValue ?? 0;

  // the current local bond value
  const [value, setValue] = useState(_value);

  // reset value to default when changing account
  useEffect(() => {
    setValue(defaultValue ?? 0);
  }, [activeAccount]);

  // handle change for unbonding
  const handleChangeUnbond = (e: React.ChangeEvent) => {
    if (!e) return;
    const element = e.currentTarget as HTMLInputElement;
    const val = element.value;

    if (!(!isNumeric(val) && val !== '')) {
      setValue(val);
      updateParentState(val);
    }
  };

  // apply bond to parent setters
  const updateParentState = (val: any) => {
    for (const s of setters) {
      s.set({
        ...s.current,
        bond: val,
      });
    }
  };

  return (
    <RowWrapper>
      <div>
        <InputWrapper>
          <section style={{ opacity: disabled ? 0.5 : 1 }}>
            <h3>
              {t('library.unbond')} {network.unit}:
            </h3>
            <input
              type="text"
              placeholder={`0 ${network.unit}`}
              value={value}
              onChange={(e) => {
                handleChangeUnbond(e);
              }}
              disabled={disabled}
            />
          </section>
        </InputWrapper>
      </div>
      <div>
        <div>
          <Button
            inline
            small
            title={t('library.max')}
            onClick={() => {
              setValue(freeToUnbondToMin);
              updateParentState(freeToUnbondToMin);
            }}
          />
        </div>
      </div>
    </RowWrapper>
  );
};
