// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  faCheckCircle,
  faEdit,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useAccount } from 'contexts/Account';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useTranslation } from 'react-i18next';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { useUi } from 'contexts/UI';
import Button from 'library/Button';
import { CardHeaderWrapper } from 'library/Graphs/Wrappers';
import { OpenHelpIcon } from 'library/OpenHelpIcon';
import { useEffect, useState } from 'react';
import { PoolAccount } from '../PoolAccount';
import { RolesWrapper } from '../Home/ManagePool/Wrappers';
import RoleEditInput from './RoleEditInput';
import { RoleEditEntry, RolesProps } from './types';

export const Roles = (props: RolesProps) => {
  const { batchKey, defaultRoles } = props;
  const { t } = useTranslation('common');

  const listenIsValid = props.listenIsValid ?? (() => {});
  const setters = props.setters ?? [];

  const { isReady } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { fetchAccountMetaBatch } = useAccount();
  const { isOwner, selectedActivePool } = useActivePools();
  const { poolsSyncing } = useUi();
  const { openModalWith } = useModal();
  const { id } = selectedActivePool || { id: 0 };
  const roles = defaultRoles;

  const initialiseEdits = (() => {
    const initState: Record<string, RoleEditEntry> = {};
    Object.entries(defaultRoles).forEach(([role, who]) => {
      initState[role] = {
        oldAddress: who,
        newAddress: who,
        valid: true,
        reformatted: false,
      };
    });
    return initState;
  })();

  // store any role edits that take place
  const [roleEdits, setRoleEdits] = useState(initialiseEdits);

  // store whether roles are being edited
  const [isEditing, setIsEditing] = useState(false);

  // store role accounts
  const [accounts, setAccounts] = useState(Object.values(roles));

  // is this the initial fetch
  const [fetched, setFetched] = useState(false);

  // update default roles on account switch
  useEffect(() => {
    setAccounts(Object.values(roles));
    setRoleEdits(initialiseEdits);
    setFetched(false);
  }, [activeAccount]);

  // fetch accounts meta batch
  useEffect(() => {
    if (isReady && !fetched) {
      setFetched(true);
      fetchAccountMetaBatch(batchKey, Object.values(roles), false);
    }
  }, [isReady, fetched]);

  const isRoleEditsValid = () => {
    for (const roleEdit of Object.values<RoleEditEntry>(roleEdits)) {
      if (roleEdit?.valid === false) {
        return false;
      }
    }
    return true;
  };

  // logic for saving edit state
  const saveHandler = () => {
    setIsEditing(false);

    // if setters available, use those to update
    // parent component state.
    if (setters.length) {
      if (listenIsValid) {
        listenIsValid(isRoleEditsValid());
      }
      const rolesUpdated: any = {};
      for (const [k, v] of Object.entries(roleEdits)) {
        rolesUpdated[k] = v.newAddress;
      }
      for (const s of setters) {
        s.set({
          ...s.current,
          roles: rolesUpdated,
        });
      }
    } else {
      // else, open modal with role edits data to update pool roles.
      openModalWith('ChangePoolRoles', { id, roleEdits }, 'small');
    }
  };

  // enter edit state
  const editHandler = () => {
    setRoleEdits(initialiseEdits);
    setIsEditing(true);
  };

  // cancel editing and revert edit state
  const cancelHandler = () => {
    setRoleEdits(initialiseEdits);
    setIsEditing(false);
  };

  // passed down to `RoleEditInput` to update roleEdits
  const setRoleEditHandler = (role: string, edit: RoleEditEntry) => {
    const newEdit = {
      ...roleEdits,
      [role]: edit,
    };
    setRoleEdits(newEdit);
  };

  return (
    <>
      <CardHeaderWrapper withAction>
        <h3>
          {t('pages.pools.roles')} <OpenHelpIcon helpKey="Pool Roles" />
        </h3>
        {!(isOwner() === true || setters.length) ? (
          <></>
        ) : (
          <>
            {isEditing && (
              <div>
                <Button
                  small
                  icon={faTimesCircle}
                  transform="grow-1"
                  inline
                  primary
                  title={t('pages.pools.cancel')}
                  disabled={poolsSyncing || isReadOnlyAccount(activeAccount)}
                  onClick={() => cancelHandler()}
                />
              </div>
            )}
            &nbsp;&nbsp;
            <div>
              <Button
                small
                icon={isEditing ? faCheckCircle : faEdit}
                transform="grow-1"
                inline
                primary
                title={
                  isEditing ? t('pages.pools.save') : t('pages.pools.edit')
                }
                disabled={
                  poolsSyncing ||
                  isReadOnlyAccount(activeAccount) ||
                  !isRoleEditsValid()
                }
                onClick={() => (isEditing ? saveHandler() : editHandler())}
              />
            </div>
          </>
        )}
      </CardHeaderWrapper>
      <RolesWrapper>
        <section>
          <div className="inner">
            <h4>{t('pages.pools.depositor')}</h4>
            <PoolAccount
              address={roles.depositor ?? null}
              batchIndex={accounts.indexOf(roles.depositor ?? '-1')}
              batchKey={batchKey}
            />
          </div>
        </section>
        <section>
          <div className="inner">
            <h4>{t('pages.pools.root')}</h4>
            {isEditing ? (
              <RoleEditInput
                roleKey="root"
                roleEdit={roleEdits?.root}
                setRoleEdit={setRoleEditHandler}
              />
            ) : (
              <PoolAccount
                address={roles.root ?? null}
                batchIndex={accounts.indexOf(roles.root ?? '-1')}
                batchKey={batchKey}
              />
            )}
          </div>
        </section>
        <section>
          <div className="inner">
            <h4>{t('pages.pools.nominator')}</h4>
            {isEditing ? (
              <RoleEditInput
                roleKey="nominator"
                roleEdit={roleEdits?.nominator}
                setRoleEdit={setRoleEditHandler}
              />
            ) : (
              <PoolAccount
                address={roles.nominator ?? null}
                batchIndex={accounts.indexOf(roles.nominator ?? '-1')}
                batchKey={batchKey}
              />
            )}
          </div>
        </section>
        <section>
          <div className="inner">
            <h4>{t('pages.pools.state_toggler')}</h4>
            {isEditing ? (
              <RoleEditInput
                roleKey="stateToggler"
                roleEdit={roleEdits?.stateToggler}
                setRoleEdit={setRoleEditHandler}
              />
            ) : (
              <PoolAccount
                address={roles.stateToggler ?? null}
                batchIndex={accounts.indexOf(roles.stateToggler ?? '-1')}
                batchKey={batchKey}
                last
              />
            )}
          </div>
        </section>
      </RolesWrapper>
    </>
  );
};
