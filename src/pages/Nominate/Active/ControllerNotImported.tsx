// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonPrimary } from '@rossbulat/polkadot-dashboard-ui';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useStaking } from 'contexts/Staking';
import { useUi } from 'contexts/UI';
import { CardHeaderWrapper, CardWrapper } from 'library/Graphs/Wrappers';
import { useTranslation } from 'react-i18next';
import { PageRowWrapper } from 'Wrappers';

export const ControllerNotImported = () => {
  const { t } = useTranslation('pages');
  const { openModalWith } = useModal();
  const { isSyncing } = useUi();
  const { getControllerNotImported } = useStaking();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { getBondedAccount } = useBalances();
  const controller = getBondedAccount(activeAccount);

  return (
    <>
      {getControllerNotImported(controller)
        ? !isSyncing &&
          !isReadOnlyAccount(activeAccount) && (
            <PageRowWrapper className="page-padding" noVerticalSpacer>
              <CardWrapper warning>
                <CardHeaderWrapper>
                  <h4>{t('nominate.controllerNotImported')}</h4>
                </CardHeaderWrapper>
                <div>
                  <ButtonPrimary
                    text={t('nominate.setNewController')}
                    onClick={() =>
                      openModalWith('UpdateController', {}, 'large')
                    }
                  />
                </div>
              </CardWrapper>
            </PageRowWrapper>
          )
        : null}
    </>
  );
};
