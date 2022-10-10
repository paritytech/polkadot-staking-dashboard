// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useModal } from 'contexts/Modal';
import { useValidators } from 'contexts/Validators';
import { ValidatorList } from 'library/ValidatorList';
import { useApi } from 'contexts/Api';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { useConnect } from 'contexts/Connect';
import { useBalances } from 'contexts/Balances';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { Warning } from 'library/Form/Warning';
import { Validator } from 'contexts/Validators/types';
import { EstimatedTxFee } from 'library/EstimatedTxFee';
import { useTxFees } from 'contexts/TxFees';
import { Title } from 'library/Modal/Title';
import { useTranslation } from 'react-i18next';
import { NotesWrapper, PaddingWrapper, FooterWrapper } from '../Wrappers';
import { ListWrapper } from './Wrappers';

export const NominateFromFavourites = () => {
  const { consts, api } = useApi();
  const { activeAccount, accountHasSigner } = useConnect();
  const { getBondedAccount } = useBalances();
  const { config, setStatus: setModalStatus, setResize } = useModal();
  const { favouritesList } = useValidators();
  const { selectedActivePool, isNominator, isOwner } = useActivePools();
  const controller = getBondedAccount(activeAccount);
  const { txFeesValid } = useTxFees();
  const { t } = useTranslation('common');

  const { maxNominations } = consts;
  const { bondType, nominations } = config;
  const signingAccount = bondType === 'pool' ? activeAccount : controller;

  // store filtered favourites
  const [availableFavourites, setAvailableFavourites] = useState<
    Array<Validator>
  >([]);

  // store selected favourites in local state
  const [selectedFavourites, setSelectedFavourites] = useState<
    Array<Validator>
  >([]);

  // store filtered favourites
  useEffect(() => {
    if (favouritesList) {
      const _availableFavourites = favouritesList.filter(
        (favourite: Validator) =>
          !nominations.find(
            (nomination: string) => nomination === favourite.address
          ) && !favourite.prefs.blocked
      );
      setAvailableFavourites(_availableFavourites);
    }
  }, []);

  // calculate active + selected favourites
  const nominationsToSubmit = nominations.concat(
    selectedFavourites.map((favourite: Validator) => favourite.address)
  );

  // valid to submit transaction
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    setResize();
  }, [selectedFavourites]);

  // ensure selected list is within limits
  useEffect(() => {
    setValid(
      nominationsToSubmit.length > 0 &&
        nominationsToSubmit.length <= maxNominations &&
        selectedFavourites.length > 0
    );
  }, [selectedFavourites]);

  const batchKey = 'nominate_from_favourites';

  const onSelected = (provider: any) => {
    const { selected } = provider;
    setSelectedFavourites(selected);
  };

  const totalAfterSelection = nominations.length + selectedFavourites.length;
  const overMaxNominations = totalAfterSelection > maxNominations;

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!valid || !api) {
      return _tx;
    }

    const targetsToSubmit = nominationsToSubmit.map((item: any) =>
      bondType === 'pool'
        ? item
        : {
            Id: item,
          }
    );

    if (bondType === 'pool') {
      _tx = api.tx.nominationPools.nominate(
        selectedActivePool?.id,
        targetsToSubmit
      );
    } else {
      _tx = api.tx.staking.nominate(targetsToSubmit);
    }
    return _tx;
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: signingAccount,
    shouldSubmit: valid,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  return (
    <>
      <Title title={t('modals.nominate_favourites')} />
      <PaddingWrapper>
        <div style={{ marginBottom: '1rem' }}>
          {!accountHasSigner(signingAccount) && (
            <Warning
              text={`{t('modals.s1')}${
                bondType === 'stake' ? ' controller ' : ' '
              }{t('modals.s3')}`}
            />
          )}
        </div>
        <ListWrapper>
          {availableFavourites.length > 0 ? (
            <ValidatorList
              bondType="stake"
              validators={availableFavourites}
              batchKey={batchKey}
              title={t('modals.f_not_nominated')}
              selectable
              selectActive
              selectToggleable={false}
              onSelected={onSelected}
              refetchOnListUpdate
              showMenu={false}
              inModal
              allowMoreCols
            />
          ) : (
            <h3>{t('modals.no_favourites_available')}</h3>
          )}
        </ListWrapper>
        <NotesWrapper style={{ paddingBottom: 0 }}>
          <EstimatedTxFee />
        </NotesWrapper>
        <FooterWrapper>
          <h3
            className={
              selectedFavourites.length === 0 ||
              nominationsToSubmit.length > maxNominations
                ? ''
                : 'active'
            }
          >
            {selectedFavourites.length > 0
              ? overMaxNominations
                ? `Adding this many favourites will surpass ${maxNominations} nominations.`
                : `Adding ${selectedFavourites.length} Nomination${
                    selectedFavourites.length !== 1 ? `s` : ``
                  }`
              : `${t('modals.no_favourites_selected')}`}
          </h3>
          <div>
            <button
              type="button"
              className="submit"
              onClick={() => submitTx()}
              disabled={
                !valid ||
                submitting ||
                (bondType === 'pool' && !isNominator() && !isOwner()) ||
                !accountHasSigner(signingAccount) ||
                !txFeesValid
              }
            >
              <FontAwesomeIcon
                transform="grow-2"
                icon={faArrowAltCircleUp as IconProp}
              />
              {t('modals.submit')}
            </button>
          </div>
        </FooterWrapper>
      </PaddingWrapper>
    </>
  );
};

export default NominateFromFavourites;
