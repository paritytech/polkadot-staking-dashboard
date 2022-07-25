// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef } from 'react';
import { useSessionEra } from 'contexts/SessionEra';

export const useEraTimeLeft = () => {
  const { sessionEra, getEraTimeLeft } = useSessionEra();

  // store era time left as state object
  const [eraTimeLeft, _setEraTimeLeft] = useState(0);

  const eraTimeLeftRef = useRef(eraTimeLeft);
  const setEraTimeLeft = (_timeleft: number) => {
    _setEraTimeLeft(_timeleft);
    eraTimeLeftRef.current = _timeleft;
  };

  // update time left every second
  // clears and resets interval on `eraProgress` update.
  let timeleftInterval: any;
  useEffect(() => {
    setEraTimeLeft(getEraTimeLeft());

    timeleftInterval = setInterval(() => {
      setEraTimeLeft(eraTimeLeftRef.current - 1);
    }, 1000);
    return () => {
      clearInterval(timeleftInterval);
    };
  }, [sessionEra]);

  return eraTimeLeftRef.current;
};

export default useEraTimeLeft;
