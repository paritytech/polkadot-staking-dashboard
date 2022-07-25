// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useConnect } from 'contexts/Connect';
import { useUi } from 'contexts/UI';
import { useApi } from 'contexts/Api';
import { GenerateNominations } from '../GenerateNominations';
import { Header } from './Header';
import { Footer } from './Footer';
import { MotionContainer } from './MotionContainer';
import { ChooseNominatorsProps } from '../types';

export const ChooseNominators = (props: ChooseNominatorsProps) => {
  const { consts } = useApi();
  const { section } = props;
  const { activeAccount } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useUi();
  const setup = getSetupProgress(activeAccount);
  const { maxNominations } = consts;

  const setterFn = () => {
    return getSetupProgress(activeAccount);
  };

  return (
    <>
      <Header
        thisSection={section}
        complete={setup.nominations.length > 0}
        title="Nominate"
        assistantPage="stake"
        assistantKey="Nominating"
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        <div style={{ marginTop: '0.5rem' }}>
          <h4>
            Choose up to {maxNominations} validators to nominate. Generate your
            nominations automatically or add a selection from your favourites.
          </h4>
          <GenerateNominations
            batchKey="generate_nominations_inactive"
            setters={[
              {
                current: {
                  callable: true,
                  fn: setterFn,
                },
                set: setActiveAccountSetup,
              },
            ]}
            nominations={setup.nominations}
          />
        </div>
        <Footer complete={setup.nominations.length > 0} />
      </MotionContainer>
    </>
  );
};

export default ChooseNominators;
