// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useModal } from 'contexts/Modal';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { BondFeedback } from 'library/Form/Bond/BondFeedback';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { planckBnToUnit, unitToPlanckBn } from 'Utils';
import { usePoolMembers } from 'contexts/Pools/PoolMembers';
import { useUi } from 'contexts/UI';
import { defaultPoolSetup } from 'contexts/UI/defaults';
import { SetupType } from 'contexts/UI/types';
import { EstimatedTxFee } from 'library/EstimatedTxFee';
import { useTxFees } from 'contexts/TxFees';
import { useTransferOptions } from 'contexts/TransferOptions';
import { useTranslation } from 'react-i18next';
import { ContentWrapper } from './Wrapper';
import { FooterWrapper, NotesWrapper } from '../Wrappers';

export const Forms = () => {
  const { api, network } = useApi();
  const { units } = network;
  const { setStatus: setModalStatus, config, setResize } = useModal();
  const { id: poolId, setActiveTab } = config;
  const { activeAccount, accountHasSigner } = useConnect();
  const { queryPoolMember, addToPoolMembers } = usePoolMembers();
  const { setActiveAccountSetup } = useUi();
  const { txFeesValid } = useTxFees();
  const { getTransferOptions } = useTransferOptions();
  const { freeBalance } = getTransferOptions(activeAccount);
  const { t } = useTranslation('common');

  // local bond value
  const [bond, setBond] = useState({
    bond: planckBnToUnit(freeBalance, units),
  });

  // bond valid
  const [bondValid, setBondValid] = useState<boolean>(true);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!bondValid || !api) {
      return _tx;
    }

    // remove decimal errors
    const bondToSubmit = unitToPlanckBn(bond.bond, units);
    _tx = api.tx.nominationPools.join(bondToSubmit, poolId);

    return _tx;
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: activeAccount,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(2);
      setActiveTab(0);
    },
    callbackInBlock: async () => {
      // query and add account to poolMembers list
      const member = await queryPoolMember(activeAccount);
      addToPoolMembers(member);

      // reset localStorage setup progress
      setActiveAccountSetup(SetupType.Pool, defaultPoolSetup);
    },
  });

  const warnings = [];
  if (!accountHasSigner(activeAccount)) {
    warnings.push(t('modals.w1'));
  }

  return (
    <ContentWrapper>
      <div>
        <>
          <BondFeedback
            bondType="pool"
            listenIsValid={setBondValid}
            defaultBond={planckBnToUnit(freeBalance, units)}
            setters={[
              {
                set: setBond,
                current: bond,
              },
            ]}
            warnings={warnings}
          />
          <NotesWrapper>
            <EstimatedTxFee />
          </NotesWrapper>
        </>
      </div>
      <FooterWrapper>
        <div>
          <button
            type="button"
            className="submit"
            onClick={() => submitTx()}
            disabled={
              submitting ||
              !bondValid ||
              !accountHasSigner(activeAccount) ||
              !txFeesValid
            }
          >
            <FontAwesomeIcon
              transform="grow-2"
              icon={faArrowAltCircleUp as IconProp}
            />
            {t('modals.submit')}
            {submitting && t('modals.ting')}
          </button>
        </div>
      </FooterWrapper>
    </ContentWrapper>
  );
};

export default Forms;
