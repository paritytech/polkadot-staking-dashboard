// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useConnect } from 'contexts/Connect';
import { useUi } from 'contexts/UI';
import { SetupType } from 'contexts/UI/types';
import { BondFeedback } from 'library/Form/Bond/BondFeedback';
import { CreatePoolStatusBar } from 'library/Form/CreatePoolStatusBar';
import { Footer } from 'library/SetupSteps/Footer';
import { Header } from 'library/SetupSteps/Header';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import { SetupStepProps } from 'library/SetupSteps/types';
import { useEffect, useState } from 'react';

export const Bond = (props: SetupStepProps) => {
  const { section } = props;
  const { activeAccount } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useUi();
  const setup = getSetupProgress(SetupType.Pool, activeAccount);

  // either free to bond or existing setup value
  const initialBondValue = setup.bond === 0 ? '' : setup.bond;

  // store local bond amount for form control
  const [bond, setBond] = useState({
    bond: initialBondValue,
  });

  // bond valid
  const [bondValid, setBondValid] = useState<boolean>(false);

  // handler for updating bond
  const handleSetupUpdate = (value: any) => {
    setActiveAccountSetup(SetupType.Pool, value);
  };

  // update bond on account change
  useEffect(() => {
    setBond({
      bond: initialBondValue,
    });
  }, [activeAccount, initialBondValue]);

  // apply initial bond value to setup progress
  useEffect(() => {
    // only update if Bond is currently active
    if (setup.section === section) {
      setActiveAccountSetup(SetupType.Pool, {
        ...setup,
        bond: initialBondValue,
      });
    }
  }, [initialBondValue, section, setActiveAccountSetup, setup, setup.section]);

  return (
    <>
      <Header
        thisSection={section}
        complete={setup.bond !== 0}
        title="Bond"
        helpKey="Bonding"
        setupType={SetupType.Pool}
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        <BondFeedback
          bondType="pool"
          inSetup
          listenIsValid={setBondValid}
          defaultBond={initialBondValue}
          setters={[
            {
              set: handleSetupUpdate,
              current: setup,
            },
            {
              set: setBond,
              current: bond,
            },
          ]}
        />
        <CreatePoolStatusBar value={bond.bond} />
        <Footer complete={bondValid} setupType={SetupType.Pool} />
      </MotionContainer>
    </>
  );
};
