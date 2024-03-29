// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CanvasFullScreenWrapper } from 'canvas/Wrappers';
import { ButtonPrimary } from 'kits/Buttons/ButtonPrimary';
import { ButtonPrimaryInvert } from 'kits/Buttons/ButtonPrimaryInvert';
import { useOverlay } from 'kits/Overlay/Provider';
import { useTranslation } from 'react-i18next';
import { JoinPoolInterfaceWrapper } from './Wrappers';

export const JoinPool = () => {
  const { t } = useTranslation();
  const { closeCanvas } = useOverlay().canvas;

  return (
    <CanvasFullScreenWrapper>
      <div className="head">
        <ButtonPrimaryInvert
          text={'Change Pool'}
          iconLeft={faArrowsRotate}
          onClick={() => {
            /* TODO: implement */
          }}
          lg
        />
        <ButtonPrimary
          text={t('cancel', { ns: 'library' })}
          lg
          onClick={() => closeCanvas()}
          iconLeft={faTimes}
          style={{ marginLeft: '1.1rem' }}
        />
      </div>
      <JoinPoolInterfaceWrapper>
        <div className="header">Pool Title</div>
        <div className="content">
          <div>Main content</div>
          <div>Side content</div>
        </div>
      </JoinPoolInterfaceWrapper>
    </CanvasFullScreenWrapper>
  );
};
