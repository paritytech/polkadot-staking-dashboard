// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { PoolState } from 'contexts/Pools/types';
import { Warning } from 'library/Form/Warning';
import { useTranslation } from 'react-i18next';
import { ContentWrapper } from './Wrappers';

export const Tasks = forwardRef((props: any, ref: any) => {
  const { setSection, setTask } = props;
  const { t } = useTranslation('common');

  const { activeBondedPool } = useActivePool();
  const poolLocked = activeBondedPool?.bondedPool?.state === PoolState.Block;
  const poolDestroying =
    activeBondedPool?.bondedPool?.state === PoolState.Destroy;

  return (
    <ContentWrapper>
      {poolDestroying && <Warning text={t('modals.w4')} />}

      <div className="items" ref={ref}>
        <button
          type="button"
          className="action-button"
          disabled={poolDestroying}
          onClick={() => {
            setSection(1);
            setTask('set_pool_metadata');
          }}
        >
          <div>
            <h3>{t('modals.rename_pool')}</h3>
            <p>{t('modals.update_name')}</p>
          </div>
          <div>
            <FontAwesomeIcon transform="shrink-2" icon={faChevronRight} />
          </div>
        </button>
        {poolLocked ? (
          <button
            type="button"
            className="action-button"
            disabled={poolDestroying}
            onClick={() => {
              setSection(1);
              setTask('unlock_pool');
            }}
          >
            <div>
              <h3>{t('modals.unlock_pool')}</h3>
              <p>{t('modals.allow_to_join')}</p>
            </div>
            <div>
              <FontAwesomeIcon transform="shrink-2" icon={faChevronRight} />
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="action-button"
            disabled={poolDestroying}
            onClick={() => {
              setSection(1);
              setTask('lock_pool');
            }}
          >
            <div>
              <h3>{t('modals.lock_pool')}</h3>
              <p>{t('modals.stop_joining_pool')}</p>
            </div>
            <div>
              <FontAwesomeIcon transform="shrink-2" icon={faChevronRight} />
            </div>
          </button>
        )}
        <button
          type="button"
          className="action-button"
          disabled={poolDestroying}
          onClick={() => {
            setSection(1);
            setTask('destroy_pool');
          }}
        >
          <div>
            <h3>{t('modals.destroy_pool')}</h3>
            <p>{t('modals.change_to_destroy')}</p>
          </div>
          <div>
            <FontAwesomeIcon transform="shrink-2" icon={faChevronRight} />
          </div>
        </button>
      </div>
    </ContentWrapper>
  );
});

export default Tasks;
