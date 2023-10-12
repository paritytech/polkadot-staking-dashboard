// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { ButtonHelp, ButtonPrimary } from '@polkadot-cloud/react';
import { useTranslation } from 'react-i18next';
import { useBonded } from 'contexts/Bonded';
import { useHelp } from 'contexts/Help';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { useStaking } from 'contexts/Staking';
import { useUi } from 'contexts/UI';
import { useValidators } from 'contexts/Validators/ValidatorEntries';
import { CardHeaderWrapper } from 'library/Card/Wrappers';
import { useUnstaking } from 'library/Hooks/useUnstaking';
import { ValidatorList } from 'library/ValidatorList';
import type { MaybeAddress } from 'types';
import { useOverlay } from '@polkadot-cloud/react/hooks';
import { useFavoriteValidators } from 'contexts/Validators/FavoriteValidators';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import { useImportedAccounts } from 'contexts/Connect/ImportedAccounts';
import { Wrapper } from './Wrapper';
import type { ManageNominationsInterface } from './types';

export const Nominations = ({
  bondFor,
  nominator,
}: {
  bondFor: 'pool' | 'nominator';
  nominator: MaybeAddress;
}) => {
  const { t } = useTranslation('pages');
  const {
    poolNominations,
    selectedActivePool,
    isOwner: isPoolOwner,
    isNominator: isPoolNominator,
  } = useActivePools();
  const { isSyncing } = useUi();
  const { openHelp } = useHelp();
  const { inSetup } = useStaking();
  const { openModal } = useOverlay().modal;
  const { isFastUnstaking } = useUnstaking();
  const { activeAccount } = useActiveAccounts();
  const { getAccountNominations } = useBonded();
  const { favoritesList } = useFavoriteValidators();
  const { isReadOnlyAccount } = useImportedAccounts();
  const { nominated: nominatorNominated, poolNominated } = useValidators();

  // Determine if pool or nominator.
  const isPool = bondFor === 'pool';

  // Derive nominations from `bondFor` type.
  const nominations = isPool
    ? poolNominations.targets
    : getAccountNominations(nominator);
  const nominated = isPool ? poolNominated : nominatorNominated;

  // Determine if this nominator is actually nominating.
  const isNominating = nominated?.length ?? false;

  // Determine whether this is a pool that is in Destroying state & not nominating.
  const poolDestroying =
    isPool &&
    selectedActivePool?.bondedPool?.state === 'Destroying' &&
    !isNominating;

  // Determine whether to display buttons.
  //
  // If regular staking and nominating, or if pool and account is nominator or root, display stop
  // button.
  const displayBtns =
    (!isPool && nominations.length) ||
    (isPool && (isPoolNominator() || isPoolOwner()));

  // Determine whether buttons are disabled.
  const btnsDisabled =
    (!isPool && inSetup()) ||
    isSyncing ||
    isReadOnlyAccount(activeAccount) ||
    poolDestroying ||
    isFastUnstaking;

  return (
    <Wrapper>
      <CardHeaderWrapper $withAction>
        <h3>
          {isPool ? t('nominate.poolNominations') : t('nominate.nominations')}
          <ButtonHelp marginLeft onClick={() => openHelp('Nominations')} />
        </h3>
        <div>
          {displayBtns && (
            <>
              <ButtonPrimary
                text={t('nominate.stop')}
                iconLeft={faStopCircle}
                iconTransform="grow-1"
                disabled={btnsDisabled}
                onClick={() =>
                  openModal({
                    key: 'ChangeNominations',
                    options: {
                      nominations: [],
                      bondFor,
                    },
                    size: 'sm',
                  })
                }
              />
              <ButtonPrimary
                text={t('nominate.manage')}
                iconLeft={faStopCircle}
                iconTransform="grow-1"
                disabled={btnsDisabled}
                marginLeft
                onClick={() =>
                  openModal({
                    key: 'ChangeNominations',
                    options: {
                      nominations: [],
                      bondFor,
                    },
                    size: 'sm',
                  })
                }
              />
            </>
          )}
        </div>
      </CardHeaderWrapper>
      {nominated === null || isSyncing ? (
        <div className="head">
          <h4>
            {!isSyncing && nominated === null
              ? t('nominate.notNominating')
              : `${t('nominate.syncing')}...`}
          </h4>
        </div>
      ) : !nominator ? (
        <div className="head">
          <h4>{t('nominate.notNominating')}</h4>
        </div>
      ) : (
        <>
          {nominated.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              <ValidatorList
                title={t('nominate.yourNominations')}
                bondFor={bondFor}
                validators={nominated}
                nominator={nominator}
                batchKey={isPool ? 'pool_nominations' : 'stake_nominations'}
                format="nomination"
                selectable={
                  !isReadOnlyAccount(activeAccount) &&
                  (!isPool || isPoolNominator() || isPoolOwner())
                }
                actions={
                  isReadOnlyAccount(activeAccount)
                    ? []
                    : [
                        {
                          title: t('nominate.stopNominatingSelected'),
                          onClick: (provider: ManageNominationsInterface) => {
                            const { selected } = provider;
                            openModal({
                              key: 'ChangeNominations',
                              options: {
                                nominations: [...nominations].filter(
                                  (n) =>
                                    !selected
                                      .map(({ address }) => address)
                                      .includes(n)
                                ),
                                provider,
                                bondFor,
                              },
                              size: 'sm',
                            });
                          },
                          onSelected: true,
                        },
                        {
                          isDisabled: () => !favoritesList?.length,
                          title: t('nominate.addFromFavorites'),
                          onClick: ({
                            setSelectActive,
                          }: ManageNominationsInterface) => {
                            setSelectActive(false);
                            openModal({
                              key: 'NominateFromFavorites',
                              options: {
                                nominations,
                                bondFor,
                              },
                              size: 'xl',
                            });
                          },
                          onSelected: false,
                        },
                      ]
                }
                refetchOnListUpdate
                allowMoreCols
                disableThrottle
              />
            </div>
          ) : (
            <div className="head">
              {poolDestroying ? (
                <h4>{t('nominate.poolDestroy')}</h4>
              ) : (
                <h4>{t('nominate.notNominating')}</h4>
              )}
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};
