// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import { TxFeesContext, useTxFees } from 'contexts/TxFees';
import { EstimatedFeeContext } from 'contexts/TxFees/types';
import React, { Context, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { planckToUnit } from 'Utils';
import { EstimatedTxFeeProps } from './types';
import { Wrapper } from './Wrapper';

export const EstimatedTxFeeInner = ({ format }: EstimatedTxFeeProps) => {
  const { t } = useTranslation('library');
  const { unit, units } = useApi().network;
  const { txFees, resetTxFees } = useTxFees();

  useEffect(() => {
    return () => resetTxFees();
  }, []);

  const txFeesUnit = planckToUnit(txFees, units).toFormat();

  return (
    <>
      {format === 'table' ? (
        <>
          <div>{t('estimatedFee')}:</div>
          <div>{txFees.isZero() ? `...` : `${txFeesUnit} ${unit}`}</div>
        </>
      ) : (
        <Wrapper>
          <p>
            <span>{t('estimatedFee')}:</span>
            {txFees.isZero() ? `...` : `${txFeesUnit} ${unit}`}
          </p>
        </Wrapper>
      )}
    </>
  );
};

export class EstimatedTxFee extends React.Component<EstimatedTxFeeProps> {
  static contextType: Context<EstimatedFeeContext> = TxFeesContext;

  componentDidMount(): void {
    const { resetTxFees } = this.context as EstimatedFeeContext;
    resetTxFees();
  }

  componentWillUnmount(): void {
    const { resetTxFees } = this.context as EstimatedFeeContext;
    resetTxFees();
  }

  render() {
    return <EstimatedTxFeeInner {...this.props} />;
  }
}
