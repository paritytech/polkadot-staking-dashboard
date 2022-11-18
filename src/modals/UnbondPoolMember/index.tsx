// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowAltCircleUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import { ButtonSubmit } from '@rossbulat/polkadot-dashboard-ui';
import BN from 'bn.js';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useTxFees } from 'contexts/TxFees';
import { EstimatedTxFee } from 'library/EstimatedTxFee';
import { Warning } from 'library/Form/Warning';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Title } from 'library/Modal/Title';
import { ContentWrapper } from 'modals/UpdateBond/Wrappers';
import {
  FooterWrapper,
  NotesWrapper,
  PaddingWrapper,
  Separator,
} from 'modals/Wrappers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { planckBnToUnit, rmCommas, unitToPlanckBn } from 'Utils';

export const UnbondPoolMember = () => {
  const { api, network, consts } = useApi();
  const { setStatus: setModalStatus, setResize, config } = useModal();
  const { activeAccount, accountHasSigner } = useConnect();
  const { txFeesValid } = useTxFees();
  const { units } = network;
  const { bondDuration } = consts;
  const { member, who } = config;
  const { points } = member;
  const freeToUnbond = planckBnToUnit(new BN(rmCommas(points)), units);
  const { t } = useTranslation('common');

  // local bond value
  const [bond, setBond] = useState({
    bond: freeToUnbond,
  });

  // bond valid
  const [bondValid, setBondValid] = useState(false);

  // unbond all validation
  const isValid = (() => {
    return freeToUnbond > 0;
  })();

  // update bond value on task change
  useEffect(() => {
    const _bond = freeToUnbond;
    setBond({ bond: _bond });
    setBondValid(isValid);
  }, [freeToUnbond, isValid]);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const getTx = () => {
    let tx = null;
    if (!bondValid || !api || !activeAccount) {
      return tx;
    }
    // remove decimal errors
    const bondToSubmit = unitToPlanckBn(bond.bond, units);
    tx = api.tx.nominationPools.unbond(who, bondToSubmit);
    return tx;
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: getTx(),
    from: activeAccount,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  return (
    <>
      <Title title={t('modals.unbond_member_funds')} icon={faMinus} />
      <PaddingWrapper verticalOnly />
      <ContentWrapper>
        {!accountHasSigner(activeAccount) && <Warning text={t('modals.w1')} />}
        <div className="items">
          <h4>{t('modals.amount_to_unbond')}</h4>
          <h2>
            {freeToUnbond} {network.unit}
          </h2>
          <Separator />
          <NotesWrapper>
            <p>{t('modals.unbound_pool_member', { bondDuration })}</p>
            {bondValid && <EstimatedTxFee />}
          </NotesWrapper>
        </div>
        <FooterWrapper>
          <div>
            <ButtonSubmit
              text={`Submit${submitting ? 'ting' : ''}`}
              iconLeft={faArrowAltCircleUp}
              iconTransform="grow-2"
              onClick={() => submitTx()}
              disabled={
                submitting ||
                !bondValid ||
                !accountHasSigner(activeAccount) ||
                !txFeesValid
              }
            />
          </div>
        </FooterWrapper>
      </ContentWrapper>
    </>
  );
};
