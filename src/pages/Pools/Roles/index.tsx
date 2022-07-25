// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useAccount } from 'contexts/Account';
import { useConnect } from 'contexts/Connect';
import { useApi } from 'contexts/Api';
import { CardHeaderWrapper } from 'library/Graphs/Wrappers';
import { OpenAssistantIcon } from 'library/OpenAssistantIcon';
import { useActivePool } from 'contexts/Pools/ActivePool';
import Button from 'library/Button';
import {
  faEdit,
  faFloppyDisk,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useUi } from 'contexts/UI';
import { useModal } from 'contexts/Modal';
import { PoolAccount } from '../PoolAccount';
import { RolesWrapper } from '../ManagePool/Wrappers';
import RoleEditInput from './RoleEditInput';

export type RoleEdit = {
  oldAddress: string;
  newAddress: string;
  valid: boolean;
  reformatted: boolean;
};

export const Roles = () => {
  const { isReady } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { fetchAccountMetaBatch } = useAccount();
  const { activeBondedPool, isOwner } = useActivePool();
  const { isSyncing } = useUi();
  const { openModalWith } = useModal();
  const activePool = activeBondedPool;
  const { id: poolId, roles } = activePool || {};

  const batchKey = 'pool_roles';

  // role edits
  const initEditState = (() => {
    const initState: Record<string, RoleEdit> = {};
    Object.entries(roles || [])?.forEach(([roleName, address]) => {
      initState[roleName] = {
        oldAddress: address,
        newAddress: address,
        valid: true,
        reformatted: false,
      };
    });
    return initState;
  })();
  const [isEditing, setIsEditing] = useState(false);
  const [roleEdits, setRoleEdits] = useState(initEditState);
  const isRoleEditsValid = () => {
    for (const roleEdit of Object.values<RoleEdit>(roleEdits)) {
      if (roleEdit?.valid === false) {
        return false;
      }
    }
    return true;
  };

  const _accounts: string[] = [
    roles?.root ?? '',
    roles?.depositor ?? '',
    roles?.nominator ?? '',
    roles?.stateToggler ?? '',
  ];

  // store role accounts
  const [accounts, setAccounts] = useState(_accounts);

  // is this the initial fetch
  const [fetched, setFetched] = useState(false);

  // update default roles on account switch
  useEffect(() => {
    setAccounts(_accounts);
    setFetched(false);
  }, [activeAccount]);

  // fetch accounts meta batch
  useEffect(() => {
    if (isReady && !fetched) {
      // setAccounts(_accounts);
      setFetched(true);
      fetchAccountMetaBatch(batchKey, _accounts, false);
    }
  }, [isReady, fetched]);

  const saveHandler = () => {
    openModalWith('ChangePoolRoles', { poolId, roleEdits }, 'small');
    setIsEditing(false);
  };
  const editHandler = () => {
    setRoleEdits(initEditState);
    setIsEditing(true);
  };
  const cancelHandler = () => {
    setRoleEdits(initEditState);
    setIsEditing(false);
  };
  return (
    <>
      <CardHeaderWrapper withAction>
        <h2>Roles</h2>
        {isOwner() ? (
          <>
            {isEditing && (
              <div>
                <Button
                  small
                  icon={faTimesCircle}
                  transform="grow-1"
                  inline
                  primary
                  title="Cancel"
                  disabled={isSyncing || isReadOnlyAccount(activeAccount)}
                  onClick={() => cancelHandler()}
                />
              </div>
            )}
            &nbsp;&nbsp;
            <div>
              <Button
                small
                icon={isEditing ? faFloppyDisk : faEdit}
                transform="grow-1"
                inline
                primary
                title={isEditing ? 'Save' : 'Edit'}
                disabled={
                  isSyncing ||
                  isReadOnlyAccount(activeAccount) ||
                  !isRoleEditsValid()
                }
                onClick={() => (isEditing ? saveHandler() : editHandler())}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </CardHeaderWrapper>
      <RolesWrapper>
        <section>
          <div className="inner">
            <h3>
              Root
              <OpenAssistantIcon page="pools" title="Pool Roles" />
            </h3>
            <PoolAccount
              address={roles?.root ?? null}
              batchIndex={accounts.indexOf(roles?.root ?? '-1')}
              batchKey={batchKey}
            />
          </div>
        </section>
        <section>
          <div className="inner">
            <h3>
              Depositor <OpenAssistantIcon page="pools" title="Pool Roles" />
            </h3>
            <PoolAccount
              address={roles?.depositor ?? null}
              batchIndex={accounts.indexOf(roles?.depositor ?? '-1')}
              batchKey={batchKey}
            />
          </div>
        </section>
        <section>
          <div className="inner">
            <h3>
              Nominator <OpenAssistantIcon page="pools" title="Pool Roles" />
            </h3>
            {isEditing ? (
              <RoleEditInput
                roleEdit={roleEdits?.nominator}
                setRoleEdit={(nominator: RoleEdit) => {
                  setRoleEdits((values: Record<string, RoleEdit>) => ({
                    ...values,
                    nominator,
                  }));
                }}
              />
            ) : (
              <PoolAccount
                address={roles?.nominator ?? null}
                batchIndex={accounts.indexOf(roles?.nominator ?? '-1')}
                batchKey={batchKey}
              />
            )}
          </div>
        </section>
        <section>
          <div className="inner">
            <h3>
              State Toggler
              <OpenAssistantIcon page="pools" title="Pool Roles" />
            </h3>
            {isEditing ? (
              <RoleEditInput
                roleEdit={roleEdits?.stateToggler}
                setRoleEdit={(stateToggler: RoleEdit) => {
                  setRoleEdits((values: Record<string, RoleEdit>) => ({
                    ...values,
                    stateToggler,
                  }));
                }}
              />
            ) : (
              <PoolAccount
                address={roles?.stateToggler ?? null}
                batchIndex={accounts.indexOf(roles?.stateToggler ?? '-1')}
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

export default Roles;
