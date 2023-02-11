// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePlugins } from 'contexts/Plugins';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import { useStaking } from 'contexts/Staking';
import { useUi } from 'contexts/UI';
import { OpenHelpIcon } from 'library/OpenHelpIcon';
import { StatusLabelProps } from './types';
import { Wrapper } from './Wrapper';

export const StatusLabel = ({
  title,
  helpKey,
  hideIcon,
  statusFor = '',
  topOffset = '40%',
  status = 'sync_or_setup',
}: StatusLabelProps) => {
  const { isSyncing } = useUi();
  const { plugins } = usePlugins();
  const { inSetup } = useStaking();
  const { membership } = usePoolMemberships();

  // syncing or not staking
  if (status === 'sync_or_setup') {
    if (isSyncing || !inSetup() || membership !== null) {
      return <></>;
    }
  }

  if (status === 'active_service') {
    if (plugins.includes(statusFor || '')) {
      return <></>;
    }
  }

  return (
    <Wrapper topOffset={topOffset}>
      <div>
        {hideIcon !== true && <FontAwesomeIcon icon={faExclamationTriangle} />}
        <h2>
          &nbsp;&nbsp;
          {title}
          {helpKey && (
            <span>
              <OpenHelpIcon helpKey={helpKey} light />
            </span>
          )}
        </h2>
      </div>
    </Wrapper>
  );
};
