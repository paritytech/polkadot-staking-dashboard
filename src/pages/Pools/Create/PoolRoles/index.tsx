// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useConnect } from 'contexts/Connect';
import { useUi } from 'contexts/UI';
import { SetupType } from 'contexts/UI/types';
import { Footer } from 'library/SetupSteps/Footer';
import { Header } from 'library/SetupSteps/Header';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import { SetupStepProps } from 'library/SetupSteps/types';
import { useEffect, useMemo, useState } from 'react';
import { Roles } from '../../Roles';

export const PoolRoles = (props: SetupStepProps) => {
  const { section } = props;
  const { activeAccount } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useUi();
  const setup = getSetupProgress(SetupType.Pool, activeAccount);

  // if no roles in setup already, inject `activeAccount` to be
  // root and depositor roles.
  const initialValue = useMemo(
    () =>
      setup.roles ?? {
        root: activeAccount,
        depositor: activeAccount,
        nominator: activeAccount,
        stateToggler: activeAccount,
      },
    [activeAccount, setup.roles]
  );

  // store local pool name for form control
  const [roles, setRoles] = useState({
    roles: initialValue,
  });

  // pool name valid
  const [rolesValid, setRolesValid] = useState<boolean>(true);

  // handler for updating pool roles
  const handleSetupUpdate = (value: any) => {
    setActiveAccountSetup(SetupType.Pool, value);
  };

  // update pool roles on account change
  useEffect(() => {
    setRoles({
      roles: initialValue,
    });
  }, [activeAccount, initialValue]);

  // apply initial pool roles to setup progress
  useEffect(() => {
    // only update if this section is currently active
    if (setup.section === section) {
      setActiveAccountSetup(SetupType.Pool, {
        ...setup,
        roles: initialValue,
      });
    }
  }, [initialValue, section, setActiveAccountSetup, setup, setup.section]);

  return (
    <>
      <Header
        thisSection={section}
        complete={setup.roles !== null}
        title="Roles"
        helpKey="Pool Roles"
        setupType={SetupType.Pool}
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        <h4 style={{ margin: '0.5rem 0' }}>
          As the pool creator, you will consume your pool&apos;s{' '}
          <b>Depositor</b> role.
        </h4>
        <h4 style={{ marginTop: 0 }}>
          Your <b>Root</b>, <b>Nominator</b> and <b>State Toggler</b> roles can
          be assigned to any account.
        </h4>
        <Roles
          batchKey="pool_roles_create"
          listenIsValid={setRolesValid}
          defaultRoles={initialValue}
          setters={[
            {
              set: handleSetupUpdate,
              current: setup,
            },
            {
              set: setRoles,
              current: roles,
            },
          ]}
        />
        <Footer complete={rolesValid} setupType={SetupType.Pool} />
      </MotionContainer>
    </>
  );
};
