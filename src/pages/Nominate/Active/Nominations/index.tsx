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
import type { MaybeAccount } from 'types';
import { useOverlay } from '@polkadot-cloud/react/hooks';
import { useFavoriteValidators } from 'contexts/Validators/FavoriteValidators';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import { useImportedAccounts } from 'contexts/Connect/ImportedAccounts';
import { Wrapper } from './Wrapper';

export const Nominations = ({
  bondFor,
  nominator,
}: {
  bondFor: 'pool' | 'nominator';
  nominator: MaybeAccount;
}) => {
  const { t } = useTranslation('pages');
  const { isSyncing } = useUi();
  const { openHelp } = useHelp();
  const { inSetup } = useStaking();
  const { openModal } = useOverlay().modal;
  const { isFastUnstaking } = useUnstaking();
  const { getAccountNominations } = useBonded();
  const { favoritesList } = useFavoriteValidators();
  const { isReadOnlyAccount } = useImportedAccounts();
  const { activeAccount } = useActiveAccounts();
  const { nominated: stakeNominated, poolNominated } = useValidators();

  const {
    poolNominations,
    isNominator: isPoolNominator,
    isOwner: isPoolOwner,
    selectedActivePool,
  } = useActivePools();

  const isPool = bondFor === 'pool';
  const nominations = isPool
    ? poolNominations.targets
    : getAccountNominations(nominator);
  const nominated = isPool ? poolNominated : stakeNominated;
  const batchKey = isPool ? 'pool_nominations' : 'stake_nominations';

  const nominating = nominated?.length ?? false;

  // callback function to stop nominating selected validators
  const cbStopNominatingSelected = (provider: any) => {
    const { selected } = provider;
    openModal({
      key: 'ChangeNominations',
      options: {
        nominations: [...nominations].filter(
          (n) => !selected.map((_s: any) => _s.address).includes(n)
        ),
        provider,
        bondFor,
      },
      size: 'sm',
    });
  };

  // callback function for adding nominations
  const cbAddNominations = ({ setSelectActive }: any) => {
    setSelectActive(false);
    openModal({
      key: 'NominateFromFavorites',
      options: {
        nominations,
        bondFor,
      },
      size: 'xl',
    });
  };

  // determine whether buttons are disabled
  const poolDestroying =
    isPool &&
    selectedActivePool?.bondedPool?.state === 'Destroying' &&
    !nominating;

  const stopBtnDisabled =
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
          {/* If regular staking and nominating, display stop button.
              If Pool and account is nominator or root, display stop button.
          */}
          {((!isPool && nominations.length) ||
            (isPool && (isPoolNominator() || isPoolOwner()))) && (
            <ButtonPrimary
              iconLeft={faStopCircle}
              iconTransform="grow-1"
              text={t('nominate.stop')}
              disabled={stopBtnDisabled}
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
                bondFor={isPool ? 'pool' : 'nominator'}
                validators={nominated}
                nominator={nominator}
                batchKey={batchKey}
                title={t('nominate.yourNominations')}
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
                          onClick: cbStopNominatingSelected,
                          onSelected: true,
                        },
                        {
                          isDisabled: () => !favoritesList?.length,
                          title: t('nominate.addFromFavorites'),
                          onClick: cbAddNominations,
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
