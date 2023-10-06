// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { determinePoolDisplay } from '@polkadot-cloud/utils';
import { useTranslation } from 'react-i18next';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { useTransferOptions } from 'contexts/TransferOptions';
import { useUi } from 'contexts/UI';
import { Stat } from 'library/Stat';
import { useOverlay } from '@polkadot-cloud/react/hooks';
import { useActiveAccount } from 'contexts/Connect/ActiveAccount';
import { useStatusButtons } from './useStatusButtons';

export const MembershipStatus = ({
  showButtons = true,
  buttonType = 'primary',
}: {
  showButtons?: boolean;
  buttonType?: string;
}) => {
  const { t } = useTranslation('pages');
  const { isReady } = useApi();
  const { isPoolSyncing } = useUi();
  const { openModal } = useOverlay().modal;
  const { activeAccount } = useActiveAccount();
  const { label, buttons } = useStatusButtons();
  const { bondedPools, meta } = useBondedPools();
  const { getTransferOptions } = useTransferOptions();
  const { isReadOnlyAccount } = useConnect();
  const { selectedActivePool, isOwner, isBouncer, isMember } = useActivePools();

  const { active } = getTransferOptions(activeAccount).pool;
  const poolState = selectedActivePool?.bondedPool?.state ?? null;

  const membershipButtons = [];
  let membershipDisplay = t('pools.notInPool');

  if (selectedActivePool) {
    const pool = bondedPools.find(
      (p: any) => p.addresses.stash === selectedActivePool.addresses.stash
    );
    if (pool) {
      // Determine pool membership display.
      const metadata = meta.bonded_pools?.metadata ?? [];
      const batchIndex = bondedPools.indexOf(pool);
      membershipDisplay = determinePoolDisplay(
        selectedActivePool.addresses.stash,
        metadata[batchIndex]
      );
    }

    // Display manage button if active account is pool owner or bouncer.
    // Or display manage button if active account is a pool member.
    if (
      (poolState !== 'Destroying' && (isOwner() || isBouncer())) ||
      (isMember() && active?.isGreaterThan(0))
    ) {
      membershipButtons.push({
        title: t('pools.manage'),
        icon: faCog,
        disabled: !isReady || isReadOnlyAccount(activeAccount),
        small: true,
        onClick: () =>
          openModal({
            key: 'ManagePool',
            options: { disableWindowResize: true },
            size: 'sm',
          }),
      });
    }
  }

  return (
    <>
      {selectedActivePool ? (
        <>
          <Stat
            label={label}
            helpKey="Pool Membership"
            type="address"
            stat={{
              address: selectedActivePool?.addresses?.stash ?? '',
              display: membershipDisplay,
            }}
            buttons={showButtons ? membershipButtons : []}
          />
        </>
      ) : (
        <Stat
          label={t('pools.poolMembership')}
          helpKey="Pool Membership"
          stat={t('pools.notInPool')}
          buttons={!showButtons || isPoolSyncing ? [] : buttons}
          buttonType={buttonType}
        />
      )}
    </>
  );
};
