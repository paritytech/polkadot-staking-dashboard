// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';
import { AnyApi } from 'types';
import { setStateWithRef } from 'Utils';
import { useApi } from '../Api';
import * as defaults from './defaults';
import { SessionEraContextInterface, SessionEra } from './types';

export const SessionEraContext =
  React.createContext<SessionEraContextInterface>(
    defaults.defaultSessionEraContext
  );

// Warning: Do not use this hook in heavy components.
// Using this hook in a component makes the component rerender per each new block.
export const useSessionEra = () => React.useContext(SessionEraContext);

export const SessionEraProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isReady, api, status, consts } = useApi();
  const { expectedBlockTime } = consts;

  useEffect(() => {
    if (status === 'connecting') {
      setStateWithRef(defaults.sessionEra, setSessioEra, sessionEraRef);
    }
  }, [status]);

  // store network metrics in state
  const [sessionEra, setSessioEra] = useState<SessionEra>(defaults.sessionEra);
  const sessionEraRef = useRef(sessionEra);

  const [unsub, setUnsub] = useState<AnyApi>(null);
  const unsubRef = useRef(unsub);

  // manage unsubscribe
  useEffect(() => {
    subscribeToSessionProgress();
    return () => {
      if (unsubRef.current !== null) {
        unsubRef.current();
      }
    };
  }, [isReady]);

  // active subscription
  const subscribeToSessionProgress = async () => {
    if (isReady && api !== null) {
      const _unsub = await api.derive.session.progress((session) => {
        setStateWithRef(
          {
            eraLength: session.eraLength.toNumber(),
            eraProgress: session.eraProgress.toNumber(),
            sessionLength: session.sessionLength.toNumber(),
            sessionProgress: session.sessionProgress.toNumber(),
            sessionsPerEra: session.sessionsPerEra.toNumber(),
          },
          setSessioEra,
          sessionEraRef
        );
      });
      setStateWithRef(_unsub, setUnsub, unsubRef);
    }
  };

  const getEraTimeLeft = () => {
    const eraBlocksLeft =
      sessionEraRef.current.eraLength - sessionEraRef.current.eraProgress;
    const eraTimeLeftSeconds = eraBlocksLeft * (expectedBlockTime * 0.001);
    const eventTime = moment().unix() + eraTimeLeftSeconds;
    const diffTime = eventTime - moment().unix();
    return diffTime;
  };

  return (
    <SessionEraContext.Provider
      value={{
        getEraTimeLeft,
        sessionEra,
      }}
    >
      {children}
    </SessionEraContext.Provider>
  );
};
