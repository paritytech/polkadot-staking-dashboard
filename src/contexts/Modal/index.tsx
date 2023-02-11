// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTxFees } from 'contexts/TxFees';
import React, { useEffect, useRef, useState } from 'react';
import { setStateWithRef } from 'Utils';
import { defaultModalContext } from './defaults';
import { ModalConfig, ModalContextInterface, ModalOptions } from './types';

export const ModalContext =
  React.createContext<ModalContextInterface>(defaultModalContext);

export const useModal = () => React.useContext(ModalContext);

// wrapper component to provide components with context
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const { notEnoughFunds } = useTxFees();

  // Store the modal configuration options.
  const [options, setOptions] = useState<ModalOptions>({
    modal: '',
    config: {},
    size: 'large',
  });

  // Store the modal's current height.
  const [height, setHeight] = useState<number>(0);

  // Store the modal status.
  const [status, setStatusState] = useState<number>(0);
  const statusRef = useRef(status);

  // Store the modal's resize counter.
  const [resize, setModalResize] = useState<number>(0);

  useEffect(() => {
    setResize();
  }, [statusRef.current, notEnoughFunds]);

  const setStatus = (newStatus: number) => {
    setHeight(newStatus === 0 ? 0 : height);
    setStateWithRef(newStatus, setStatusState, statusRef);
    setResize();
  };

  const openModalWith = (
    modal: string,
    config: ModalConfig = {},
    size = 'large'
  ) => {
    setStateWithRef(1, setStatusState, statusRef);
    setResize();
    setOptions({
      modal,
      config,
      size,
    });
  };

  const setModalHeight = (h: number) => {
    if (statusRef.current === 0) return;
    // set maximum height to 80% of window height
    const maxHeight = window.innerHeight * 0.8;
    h = h > maxHeight ? maxHeight : h;
    setHeight(h);
  };

  // increments resize to trigger a height transition.
  const setResize = () => {
    setModalResize(resize + 1);
  };

  return (
    <ModalContext.Provider
      value={{
        status: statusRef.current,
        setStatus,
        openModalWith,
        setModalHeight,
        setResize,
        height,
        resize,
        modal: options.modal,
        config: options.config,
        size: options.size,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
