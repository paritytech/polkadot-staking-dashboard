// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  faRedoAlt,
  faWallet,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Separator } from 'Wrappers';
import { CardWrapper } from 'library/Graphs/Wrappers';
import { useStaking } from 'contexts/Staking';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { PAYEE_STATUS } from 'consts';
import { useUi } from 'contexts/UI';
import { useApi } from 'contexts/Api';
import Stat from 'library/Stat';

export const Status = () => {
  const { isReady } = useApi();
  const { setOnSetup, getSetupProgressPercent }: any = useUi();
  const { openModalWith } = useModal();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { isSyncing } = useUi();
  const { getNominationsStatus, staking, inSetup } = useStaking();
  const { getAccountNominations } = useBalances();
  const { payee } = staking;
  const nominations = getAccountNominations(activeAccount);

  // get nomination status
  const nominationStatuses = getNominationsStatus();

  const active = Object.values(nominationStatuses).filter(
    (_v) => _v === 'active'
  ).length;

  const payeeStatus = PAYEE_STATUS.find((item) => item.key === payee);

  let startTitle = 'Start Staking';
  if (inSetup()) {
    const progress = getSetupProgressPercent(activeAccount);
    if (progress > 0) {
      startTitle += `: ${progress}%`;
    }
  }
  return (
    <CardWrapper height={300}>
      <Stat
        label="Status"
        assistant={['stake', 'Staking Status']}
        stat={
          inSetup() || isSyncing
            ? 'Not Staking'
            : !nominations.length
            ? 'Inactive: Not Nominating'
            : active
            ? 'Actively Nominating with Bonded Funds'
            : 'Waiting for Active Nominations'
        }
        buttons={
          !inSetup()
            ? []
            : [
                {
                  title: startTitle,
                  icon: faChevronCircleRight,
                  transform: 'grow-1',
                  disabled:
                    !isReady ||
                    isReadOnlyAccount(activeAccount) ||
                    !activeAccount,
                  onClick: () => setOnSetup(true),
                },
              ]
        }
      />
      <Separator />
      <Stat
        label="Reward Destination"
        assistant={['stake', 'Reward Destination']}
        icon={
          (payee === null
            ? faCircle
            : payee === 'Staked'
            ? faRedoAlt
            : payee === 'None'
            ? faCircle
            : faWallet) as IconProp
        }
        stat={inSetup() ? 'Not Assigned' : payeeStatus?.name ?? 'Not Assigned'}
        buttons={
          payeeStatus
            ? [
                {
                  title: 'Update',
                  icon: faWallet,
                  small: true,
                  disabled:
                    inSetup() || isSyncing || isReadOnlyAccount(activeAccount),
                  onClick: () => openModalWith('UpdatePayee', {}, 'small'),
                },
              ]
            : []
        }
      />
    </CardWrapper>
  );
};

export default Status;
