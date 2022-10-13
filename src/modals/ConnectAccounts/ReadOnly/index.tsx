// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useConnect } from 'contexts/Connect';
import { ExternalAccount, ImportedAccount } from 'contexts/Connect/types';
import { faGlasses, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ExtensionWrapper } from '../Wrappers';
import { Wrapper } from './Wrapper';
import { ReadOnlyInput } from '../ReadOnlyInput';
import { ReadOnlyProps } from '../types';

export const ReadOnly = (props: ReadOnlyProps) => {
  const { setReadOnlyOpen, readOnlyOpen } = props;
  const { t } = useTranslation('common');

  const { accounts, forgetAccounts } = useConnect();

  // get all external accounts
  const externalAccountsOnly = accounts.filter((a: ImportedAccount) => {
    return a.source === 'external';
  }) as Array<ExternalAccount>;

  // get external accounts added by user
  const externalAccountsByUser = externalAccountsOnly.filter(
    (a: ExternalAccount) => a.addedBy === 'user'
  );

  // forget account
  const forgetAccount = (account: ExternalAccount) => {
    forgetAccounts([account]);
  };
  return (
    <Wrapper>
      <ExtensionWrapper noSpacing>
        <button
          type="button"
          onClick={() => {
            setReadOnlyOpen(!readOnlyOpen);
          }}
        >
          <FontAwesomeIcon
            icon={faGlasses}
            transform="grow-2"
            style={{ margin: '0 0.75rem 0 1.25rem' }}
          />
          <h3>
            <span className="name">{t('modals.read_only_accounts')}</span>
          </h3>

          <div>
            <h3>
              <span
                className={`message${
                  externalAccountsByUser.length ? ` success` : ``
                }`}
              >
                {externalAccountsByUser.length
                  ? `${externalAccountsByUser.length} ${t('modals.connected')}`
                  : ``}
              </span>
            </h3>
            {!readOnlyOpen && <FontAwesomeIcon icon={faCog} className="icon" />}
          </div>
        </button>
      </ExtensionWrapper>
      {readOnlyOpen && (
        <div className="content">
          <ReadOnlyInput />
          {externalAccountsByUser.length > 0 &&
            (i18next.resolvedLanguage === 'en' ? (
              <h5>
                {externalAccountsByUser.length} Read Only Account
                {externalAccountsByUser.length === 1 ? '' : 's'}
              </h5>
            ) : (
              <h5>{externalAccountsByUser.length} 个只读帐户</h5>
            ))}
          <div className="accounts">
            {externalAccountsByUser.map((a: ExternalAccount, i: number) => (
              <div key={`user_external_account_${i}`} className="account">
                <div>{a.address}</div>
                <button
                  type="button"
                  onClick={() => {
                    forgetAccount(a);
                  }}
                >
                  {t('modals.forget')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Wrapper>
  );
};
