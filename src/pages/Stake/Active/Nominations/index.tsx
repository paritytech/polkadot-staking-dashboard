// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Wrapper } from './Wrapper';
import { useApi } from '../../../../contexts/Api';
import { useValidators } from '../../../../contexts/Validators';
import { ValidatorList } from '../../../../library/ValidatorList';
import { OpenAssistantIcon } from '../../../../library/OpenAssistantIcon';
import { Button } from '../../../../library/Button';
import { useModal } from '../../../../contexts/Modal';
import { useBalances } from '../../../../contexts/Balances';
import { useConnect } from '../../../../contexts/Connect';
import { useUi } from '../../../../contexts/UI';

export const Nominations = () => {
  const { openModalWith } = useModal();
  const { isReady }: any = useApi();
  const { activeAccount } = useConnect();
  const { nominated }: any = useValidators();
  const { getAccountNominations }: any = useBalances();
  const { isSyncing } = useUi();
  const nominations = getAccountNominations(activeAccount);

  const batchKey = 'stake_nominations';

  return (
    <Wrapper>
      <div className="head">
        <h2>
          Nominations
          <OpenAssistantIcon page="stake" title="Nominations" />
        </h2>
        <div>
          {nominations.length ? (
            <div>
              <Button
                small
                inline
                primary
                title="Stop"
                onClick={() => openModalWith('StopNominating', {}, 'small')}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      {nominated === null || isSyncing() ? (
        <div className="head">
          <h3>Fetching your nominations...</h3>
        </div>
      ) : (
        <>
          {isReady && (
            <>
              {nominated.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <ValidatorList
                    validators={nominated}
                    batchKey={batchKey}
                    title="Your Nominations"
                    refetchOnListUpdate
                    allowMoreCols
                    disableThrottle
                  />
                </div>
              ) : (
                <div className="head">
                  <h3>Not Nominating.</h3>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default Nominations;
