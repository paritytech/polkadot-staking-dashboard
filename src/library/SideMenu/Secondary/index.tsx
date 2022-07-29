// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import { CONNECTION_SYMBOL_COLORS } from 'consts';
import { ConnectionStatus } from 'contexts/Api/types';
import { useModal } from 'contexts/Modal';
import { Wrapper, MinimisedWrapper, IconWrapper } from './Wrappers';
import { SecondaryProps } from '../types';

export const Secondary = (props: SecondaryProps) => {
  const { status, isLightClient } = useApi();
  const { openModalWith } = useModal();

  const { action, name, icon, minimised } = props;
  const { Svg, size } = icon;

  const StyledWrapper = minimised ? MinimisedWrapper : Wrapper;

  const symbolColor =
    status === ConnectionStatus.Connecting
      ? CONNECTION_SYMBOL_COLORS.connecting
      : status === ConnectionStatus.Connected
      ? CONNECTION_SYMBOL_COLORS.connected
      : CONNECTION_SYMBOL_COLORS.disconnected;

  return (
    <StyledWrapper
      onClick={() => {
        openModalWith('Networks');
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.1,
      }}
      style={{
        borderColor: minimised ? symbolColor.transparent : undefined,
      }}
    >
      <IconWrapper
        minimised={minimised}
        className="icon"
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size} />
      </IconWrapper>

      {!minimised && (
        <div className="name">
          {name}
          <span className="light">{isLightClient ? 'light' : ''}</span>
        </div>
      )}
      {!minimised && (
        <div className={`action${minimised ? ' minimised' : ''}`}>{action}</div>
      )}
    </StyledWrapper>
  );
};

export default Secondary;
