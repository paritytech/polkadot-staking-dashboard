// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  ButtonPrimaryInvert,
  ModalPadding,
  ModalWarnings,
} from '@polkadotcloud/core-ui';
import { planckToUnit } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { useApi } from 'contexts/Api';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useTransferOptions } from 'contexts/TransferOptions';
import { Warning } from 'library/Form/Warning';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReserveWrapper } from './Wrapper';

export const UpdateReserve = () => {
  const { t } = useTranslation('modals');
  const { reserve, setReserve, getTransferOptions } = useTransferOptions();
  const { units } = useApi().network;
  const { activeAccount, accountHasSigner } = useConnect();
  const { getLocks, getBalance } = useBalances();
  const balance = getBalance(activeAccount);
  const { network } = useApi();
  const { setStatus } = useModal();
  const allTransferOptions = getTransferOptions(activeAccount);
  const { frozen } = balance;

  // check account non-staking locks
  const locks = getLocks(activeAccount);
  const locksStaking = locks.find(({ id }) => id === 'staking');
  const lockStakingAmount = locksStaking
    ? locksStaking.amount
    : new BigNumber(0);
  const fundsFree = planckToUnit(
    allTransferOptions.freeBalance.minus(frozen.minus(lockStakingAmount)),
    units
  );

  const warnings = [];
  if (fundsFree.isZero()) {
    warnings.push(<Warning text={t('reserveLimit')} />);
  }

  const sliderProps = {
    trackStyle: {
      backgroundColor: 'var(--network-color-primary)',
    },
    handleStyle: {
      backgroundColor: 'var(--background-primary)',
      borderColor: 'var(--network-color-primary)',
      opacity: 1,
    },
  };

  return (
    <ModalPadding>
      <h2 className="title unbounded" style={{ margin: '0.5rem' }}>
        Update Reserve
      </h2>
      {warnings.length ? (
        <ModalWarnings>
          {warnings.map((warning, index) => (
            <React.Fragment key={`warning_${index}`}>{warning}</React.Fragment>
          ))}
        </ModalWarnings>
      ) : null}
      <ReserveWrapper>
        <div>
          <h4 className="current">{reserve.toString()} </h4>
          <div className="slider">
            <Slider
              max={1}
              value={reserve.toNumber()}
              step={0.1}
              onChange={(val) => {
                if (typeof val === 'number') {
                  setReserve(new BigNumber(val));
                }
              }}
              {...sliderProps}
            />
          </div>
        </div>
        <div className="confirm">
          <ButtonPrimaryInvert
            text={t('confirm')}
            onClick={() => {
              setStatus(0);
              localStorage.setItem(
                `${network.name}_${activeAccount}_reserve`,
                reserve.toString()
              );
            }}
            disabled={
              !accountHasSigner(activeAccount) ||
              reserve.toString() ===
                localStorage.getItem(`${network.name}_${activeAccount}_reserve`)
            }
          />
        </div>
      </ReserveWrapper>
    </ModalPadding>
  );
};
