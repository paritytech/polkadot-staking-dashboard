// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wrapper } from './Wrapper';

export const ErrorFallbackApp = ({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <Wrapper className="app">
      <h3>
        <FontAwesomeIcon icon={faBug} transform="grow-25" />
      </h3>
      <h1>{t('library.oops')}</h1>
      <h2>
        <button type="button" onClick={resetErrorBoundary}>
          {t('library.click_to_reload')}
        </button>
      </h2>
    </Wrapper>
  );
};

export const ErrorFallbackRoutes = ({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <Wrapper>
      <h3 className="with-margin">
        <FontAwesomeIcon icon={faBug} transform="grow-25" />
      </h3>
      <h1>{t('library.oops')}</h1>
      <h2>
        <button type="button" onClick={resetErrorBoundary}>
          {t('library.click_to_reload')}
        </button>
      </h2>
    </Wrapper>
  );
};

export const ErrorFallbackModal = ({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <Wrapper className="modal">
      <h2>{t('library.oops')}</h2>
      <h4>
        <button type="button" onClick={resetErrorBoundary}>
          {t('library.click_to_reload')}
        </button>
      </h4>
    </Wrapper>
  );
};
