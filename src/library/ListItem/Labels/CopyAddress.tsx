// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import type { NotificationText } from 'controllers/NotificationsController/types';
import type { CopyAddressProps } from '../types';
import { NotificationsController } from 'controllers/NotificationsController';

export const CopyAddress = ({ address }: CopyAddressProps) => {
  const { t } = useTranslation('library');

  // copy address notification
  const notificationCopyAddress: NotificationText | null =
    address == null
      ? null
      : {
          title: t('addressCopiedToClipboard'),
          subtitle: address,
        };

  return (
    <div className="label">
      <button
        type="button"
        onClick={() => {
          if (notificationCopyAddress) {
            NotificationsController.emit(notificationCopyAddress);
          }
          navigator.clipboard.writeText(address || '');
        }}
      >
        <FontAwesomeIcon icon={faCopy} transform="shrink-1" />
      </button>
    </div>
  );
};
