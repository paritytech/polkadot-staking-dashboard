// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useApi } from 'contexts/Api';
import { useUi } from 'contexts/UI';
import { useConnect } from 'contexts/Connect';
import { Button } from 'library/Button';
import { humanNumber } from 'Utils';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Warning } from 'library/Form/Warning';
import { SummaryProps } from 'pages/Stake/types';
import { SummaryWrapper } from './Wrapper';
import { MotionContainer } from '../MotionContainer';
import { Header } from '../Header';

export const Summary = (props: SummaryProps) => {
  const { section } = props;

  const { api, network } = useApi();
  const { units } = network;
  const { activeAccount, accountHasSigner } = useConnect();
  const { getSetupProgress } = useUi();
  const setup = getSetupProgress(activeAccount);

  const { controller, bond, nominations, payee } = setup;

  const txs = () => {
    if (!activeAccount || !api) {
      return null;
    }
    const stashToSubmit = {
      Id: activeAccount,
    };
    const bondToSubmit = bond * 10 ** units;
    const targetsToSubmit = nominations.map((item: any) => {
      return {
        Id: item.address,
      };
    });
    const controllerToSubmit = {
      Id: controller,
    };

    // construct a batch of transactions
    const _txs = [
      api.tx.staking.bond(stashToSubmit, bondToSubmit, payee),
      api.tx.staking.nominate(targetsToSubmit),
      api.tx.staking.setController(controllerToSubmit),
    ];
    return api.tx.utility.batch(_txs);
  };

  const { submitTx, estimatedFee, submitting } = useSubmitExtrinsic({
    tx: txs(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {},
    callbackInBlock: () => {},
  });

  return (
    <>
      <Header thisSection={section} complete={null} title="Summary" />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        {!accountHasSigner(activeAccount) && (
          <Warning text="Your account is read only, and cannot sign transactions." />
        )}
        <SummaryWrapper>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Controller:
            </div>
            <div>{controller}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Reward Destination:
            </div>
            <div>{payee}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Nominations:
            </div>
            <div>{nominations.length}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Bond Amount:
            </div>
            <div>
              {humanNumber(bond)} {network.unit}
            </div>
          </section>
          <section>
            <div>Estimated Tx Fee:</div>
            <div>{estimatedFee === null ? '...' : `${estimatedFee}`}</div>
          </section>
        </SummaryWrapper>
        <div
          style={{
            flex: 1,
            flexDirection: 'row',
            width: '100%',
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <Button
            onClick={() => submitTx()}
            disabled={submitting || !accountHasSigner(activeAccount)}
            title="Start Staking"
            primary
          />
        </div>
      </MotionContainer>
    </>
  );
};

export default Summary;
