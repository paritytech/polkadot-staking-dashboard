// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { motion } from 'framer-motion';
import { clipAddress } from 'Utils';
import { Identicon } from 'library/Identicon';
import { useNotifications } from 'contexts/Notifications';
import { useAccount } from 'contexts/Account';
import { getIdentityDisplay } from 'library/ValidatorList/Validator/Utils';
import { NotificationText } from 'contexts/Notifications/types';
import { AccountWrapper } from './Wrappers';
import { PoolAccountProps } from './types';

export const PoolAccount = (props: PoolAccountProps) => {
  const { address, last, batchKey, batchIndex } = props;

  const { addNotification } = useNotifications();
  const { meta } = useAccount();

  const identities = meta[batchKey]?.identities ?? [];
  const supers = meta[batchKey]?.supers ?? [];

  const identitiesSynced = identities.length > 0 ?? false;
  const supersSynced = supers.length > 0 ?? false;
  const synced = identitiesSynced && supersSynced;

  const display = getIdentityDisplay(
    identities[batchIndex],
    supers[batchIndex]
  );

  let notification: NotificationText | null = null;
  if (address !== null) {
    notification = {
      title: 'Address Copied to Clipboard',
      subtitle: address,
    };
  }

  return (
    <AccountWrapper last={last}>
      <motion.div
        className="account"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {address === null ? (
          <h4>Not Set</h4>
        ) : synced && display !== null ? (
          <>
            <div className="icon">
              <Identicon value={address} size="1.6rem" />
            </div>
            <h4>{display}</h4>
          </>
        ) : (
          <>
            <div className="icon">
              <Identicon value={address} size="1.6rem" />
            </div>
            <h4>{clipAddress(address)}</h4>
          </>
        )}
        <div>
          <motion.div
            className="copy"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {address !== null && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  if (notification) {
                    addNotification(notification);
                  }
                }}
              >
                <FontAwesomeIcon icon={faCopy as IconProp} transform="grow-1" />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AccountWrapper>
  );
};

export default PoolAccount;
