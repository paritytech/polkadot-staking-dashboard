// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  PageRowWrapper,
  RowPrimaryWrapper,
  RowSecondaryWrapper,
} from 'Wrappers';
import { CardWrapper, CardHeaderWrapper } from 'library/Graphs/Wrappers';
import { StatBoxList } from 'library/StatBoxList';
import { useStaking } from 'contexts/Staking';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { Button } from 'library/Button';
import { PageTitle } from 'library/PageTitle';
import { OpenAssistantIcon } from 'library/OpenAssistantIcon';
import { useModal } from 'contexts/Modal';
import { useUi } from 'contexts/UI';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { Nominations } from './Nominations';
import { ManageBond } from './ManageBond';
import { GenerateNominations } from '../GenerateNominations';
import ActiveNominationsStatBox from './Stats/ActiveNominations';
import InacctiveNominationsStatBox from './Stats/InactiveNominations';
import MinimumActiveBondStatBox from './Stats/MinimumActiveBond';
import MinNominatorBondBox from './Stats/MinNominatorBond';
import { ControllerNotImported } from './ControllerNotImported';
import { Status } from './Status';

export const Active = ({ title }: any) => {
  const { openModalWith } = useModal();
  const { activeAccount } = useConnect();
  const { isSyncing } = useUi();
  const { targets, setTargets, inSetup } = useStaking();
  const { getAccountNominations } = useBalances();
  const nominations = getAccountNominations(activeAccount);

  return (
    <>
      <PageTitle title={title} />
      <StatBoxList>
        <MinimumActiveBondStatBox />
        <MinNominatorBondBox />
        <ActiveNominationsStatBox />
        <InacctiveNominationsStatBox />
      </StatBoxList>
      <ControllerNotImported />
      <PageRowWrapper className="page-padding" noVerticalSpacer>
        <RowPrimaryWrapper hOrder={1} vOrder={0}>
          <Status />
        </RowPrimaryWrapper>
        <RowSecondaryWrapper hOrder={0} vOrder={1}>
          <CardWrapper height={300}>
            <ManageBond />
          </CardWrapper>
        </RowSecondaryWrapper>
      </PageRowWrapper>
      <PageRowWrapper className="page-padding" noVerticalSpacer>
        <CardWrapper>
          {nominations.length || inSetup() || isSyncing ? (
            <Nominations bondType="stake" />
          ) : (
            <>
              <CardHeaderWrapper withAction>
                <h2>
                  Start Nominating
                  <OpenAssistantIcon page="stake" title="Nominations" />
                </h2>
                <div>
                  <Button
                    small
                    inline
                    primary
                    title="Nominate"
                    icon={faChevronCircleRight}
                    transform="grow-1"
                    disabled={targets.length === 0 || inSetup() || isSyncing}
                    onClick={() => openModalWith('Nominate', {}, 'small')}
                  />
                </div>
              </CardHeaderWrapper>
              <GenerateNominations
                batchKey="generate_nominations_active"
                setters={[
                  {
                    set: setTargets,
                    current: targets,
                  },
                ]}
                nominations={targets.nominations}
              />
            </>
          )}
        </CardWrapper>
      </PageRowWrapper>
    </>
  );
};

export default Active;
