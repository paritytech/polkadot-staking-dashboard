// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { u8aToBuffer } from '@polkadot/util';
import { localStorageOrDefault, setStateWithRef } from '@polkadot-cloud/utils';
import type { SubstrateApp } from '@zondax/ledger-substrate';
import { newSubstrateApp } from '@zondax/ledger-substrate';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LedgerAccount } from '@polkadot-cloud/react/types';
import type { AnyFunction, AnyJson, MaybeString } from 'types';
import { useNetwork } from 'contexts/Network';
import {
  getLedgerErrorType,
  getLocalLedgerAccounts,
  getLocalLedgerAddresses,
  isLocalNetworkAddress,
} from './Utils';
import {
  LEDGER_DEFAULT_ACCOUNT,
  LEDGER_DEFAULT_CHANGE,
  LEDGER_DEFAULT_INDEX,
  TOTAL_ALLOWED_STATUS_CODES,
  defaultFeedback,
  defaultLedgerHardwareContext,
} from './defaults';
import type {
  FeedbackMessage,
  LedgerAddress,
  LedgerHardwareContextInterface,
  LedgerResponse,
  LedgerStatusCode,
  LedgerTask,
  PairingStatus,
} from './types';

export const LedgerHardwareProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('modals');
  const { network } = useNetwork();

  // ledgerAccounts
  // Store the fetched ledger accounts.
  const [ledgerAccounts, setLedgerAccountsState] = useState<LedgerAccount[]>(
    getLocalLedgerAccounts(network)
  );
  const ledgerAccountsRef = useRef(ledgerAccounts);

  // isPaired
  // Store whether the device has been paired.
  const [isPaired, setIsPairedState] = useState<PairingStatus>('unknown');
  const isPairedRef = useRef(isPaired);
  const setIsPaired = (p: PairingStatus) =>
    setStateWithRef(p, setIsPairedState, isPairedRef);

  // isExecuting
  // Store whether an import is in progress.
  const [isExecuting, setIsExecutingState] = useState(false);
  const isExecutingRef = useRef(isExecuting);
  const getIsExecuting = () => isExecutingRef.current;
  const setIsExecuting = (val: boolean) =>
    setStateWithRef(val, setIsExecutingState, isExecutingRef);

  // statusCodes
  // Store status codes received from Ledger device.
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);
  const getStatusCodes = () => statusCodesRef.current;
  const resetStatusCodes = () =>
    setStateWithRef([], setStatusCodes, statusCodesRef);

  // feedback
  // Get the default message to display, set when a failed loop has happened.
  const [feedback, setFeedbackState] =
    useState<FeedbackMessage>(defaultFeedback);
  const feedbackRef = useRef(feedback);
  const getFeedback = () => feedbackRef.current;
  const setFeedback = (message: MaybeString, helpKey: MaybeString = null) =>
    setStateWithRef({ message, helpKey }, setFeedbackState, feedbackRef);
  const resetFeedback = () =>
    setStateWithRef(defaultFeedback, setFeedbackState, feedbackRef);

  // ledgerTransport
  // The ledger transport interface.
  const ledgerTransport = useRef<any>(null);
  const getTransport = () => ledgerTransport.current;

  // transportResponse
  // Store the latest successful response from an attempted `executeLedgerLoop`.
  const [transportResponse, setTransportResponse] = useState<AnyJson>(null);

  // Whether pairing is in progress.
  // Protects against re-renders & duplicate pairing attempts.
  const pairInProgress = useRef(false);

  // Whether a ledger-loop is in progress.
  // Protects against re-renders & duplicate attempts.
  const ledgerLoopInProgress = useRef(false);

  // Handles errors that occur during `executeLedgerLoop` and `pairDevice` calls.
  const handleErrors = (appName: string, err: unknown) => {
    const errStr = String(err);

    // Reset any in-progress calls.
    ledgerLoopInProgress.current = false;
    pairInProgress.current = false;

    // Execution failed - no longer executing.
    setIsExecuting(false);

    // Close any open device connections.
    if (ledgerTransport.current?.device?.opened)
      ledgerTransport.current?.device?.close();

    // Update feedback and status code state based on error received.
    switch (getLedgerErrorType(errStr)) {
      // Occurs when the device does not respond to a request within the timeout period.
      case 'timeout':
        updateFeedbackAndStatusCode({
          message: t('ledgerRequestTimeout'),
          helpKey: 'Ledger Request Timeout',
          code: 'DeviceTimeout',
        });
        break;
      // Occurs when one or more of nested calls being signed does not support nesting.
      case 'nestingNotSupported':
        updateFeedbackAndStatusCode({
          message: t('missingNesting'),
          code: 'NestingNotSupported',
        });
        break;
      // Cccurs when the device is not connected.
      case 'deviceNotConnected':
        updateFeedbackAndStatusCode({
          message: t('connectLedgerToContinue'),
          code: 'DeviceNotConnected',
        });
        break;
      // Occurs when tx was approved outside of active channel.
      case 'outsideActiveChannel':
        updateFeedbackAndStatusCode({
          message: t('queuedTransactionRejected'),
          helpKey: 'Wrong Transaction',
          code: 'WrongTransaction',
        });
        break;
      // Occurs when the device is already in use.
      case 'deviceBusy':
        updateFeedbackAndStatusCode({
          message:
            'The Ledger device is currently being used by other software.',
          code: 'DeviceBusy',
        });
        break;
      // Occurs when the device is locked.
      case 'deviceLocked':
        updateFeedbackAndStatusCode({
          message: t('unlockLedgerToContinue'),
          code: 'DeviceLocked',
        });
        break;
      // Occurs when the app (e.g. Polkadot) is not open.
      case 'appNotOpen':
        updateFeedbackAndStatusCode({
          message: t('openAppOnLedger', { appName }),
          helpKey: 'Open App On Ledger',
          code: 'TransactionRejected',
        });
        break;
      // Occurs when a user rejects a transaction.
      case 'transactionRejected':
        updateFeedbackAndStatusCode({
          message: t('transactionRejectedPending'),
          helpKey: 'Ledger Rejected Transaction',
          code: 'AppNotOpen',
        });
        break;
      // Handle all other errors.
      default:
        // TODO: if runtime version is out of date, flag that this may be causing the error.
        setFeedback(t('openAppOnLedger', { appName }), 'Open App On Ledger');
        handleNewStatusCode('failure', 'AppNotOpen');
    }
  };

  // Attempt to pair a device.
  //
  // Trigger a one-time connection to the device to determine if it is available. If the device
  // needs to be paired, a browser prompt will open. If cancelled, an error will be thrown.
  const pairDevice = async () => {
    try {
      // return `paired` if pairing is already in progress.
      if (pairInProgress.current) {
        return isPairedRef.current === 'paired';
      }
      // set pairing in progress.
      pairInProgress.current = true;

      // remove any previously stored status codes.
      resetStatusCodes();

      // close any open connections.
      if (ledgerTransport.current?.device?.opened) {
        await ledgerTransport.current?.device?.close();
      }
      // establish a new connection with device.
      ledgerTransport.current = await TransportWebHID.create();
      setIsPaired('paired');
      pairInProgress.current = false;
      return true;
    } catch (err) {
      pairInProgress.current = false;
      handleErrors('', err);
      return false;
    }
  };

  // Connects to a Ledger device to perform a task. This is the main execute function that handles
  // all Ledger tasks, along with errors that occur during the process.
  const executeLedgerLoop = async (
    appName: string,
    tasks: LedgerTask[],
    options?: AnyJson
  ) => {
    try {
      // do not execute again if already in progress.
      if (ledgerLoopInProgress.current) {
        return;
      }

      // set ledger loop in progress.
      ledgerLoopInProgress.current = true;

      // test for tasks and execute them. This is designed such that `result` will only store the
      // result of one task. This will have to be refactored if we ever need to execute multiple
      // tasks at once.
      let result = null;
      if (tasks.includes('get_address')) {
        result = await handleGetAddress(appName, options?.accountIndex || 0);
      } else if (tasks.includes('sign_tx')) {
        const uid = options?.uid || 0;
        const index = options?.accountIndex || 0;
        const payload = options?.payload || '';

        result = await handleSignTx(appName, uid, index, payload);
      }

      // a populated result indicates a successful execution. Set the transport response state for
      // other components to respond to via useEffect.
      if (result) {
        setTransportResponse({
          ack: 'success',
          options,
          ...result,
        });
      }
      ledgerLoopInProgress.current = false;
    } catch (err) {
      handleErrors(appName, err);
    }
  };

  // Gets runtime version.
  const handleGetVersion = async (substrateApp: SubstrateApp) => {
    await ensureTransportOpen();

    const result: AnyJson = await withTimeout(3000, substrateApp.getVersion());
    if (!(result instanceof Error)) {
      return result;
    }
    return undefined;
  };

  // Gets an app address on device.
  const handleGetAddress = async (appName: string, index: number) => {
    const substrateApp = newSubstrateApp(ledgerTransport.current, appName);
    const { deviceModel } = ledgerTransport.current;
    const { id, productName } = deviceModel;

    // Check version before getting address.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const version = await handleGetVersion(substrateApp);
    // TODO: if an error is returned, prompt the user that the Ledger runtime version does not match
    // the current one, that may be resulting in the error.

    setTransportResponse({
      ack: 'success',
      statusCode: 'GettingAddress',
      body: null,
    });
    setFeedback(t('gettingAddress'));
    await ensureTransportOpen();

    const result: AnyJson = await withTimeout(
      3000,
      substrateApp.getAddress(
        LEDGER_DEFAULT_ACCOUNT + index,
        LEDGER_DEFAULT_CHANGE,
        LEDGER_DEFAULT_INDEX + 0,
        false
      )
    );

    await ledgerTransport.current?.device?.close();
    const error = result?.error_message;
    if (error) {
      if (!error.startsWith('No errors')) {
        throw new Error(error);
      }
    }

    if (!(result instanceof Error)) {
      setFeedback(t('successfullyFetchedAddress'));

      return {
        statusCode: 'ReceivedAddress',
        device: { id, productName },
        body: [result],
      };
    }
    return undefined;
  };

  // Signs a payload on device.
  const handleSignTx = async (
    appName: string,
    uid: number,
    index: number,
    payload: AnyJson
  ) => {
    const substrateApp = newSubstrateApp(ledgerTransport.current, appName);
    const { deviceModel } = ledgerTransport.current;
    const { id, productName } = deviceModel;

    setTransportResponse({
      ack: 'success',
      statusCode: 'SigningPayload',
      body: null,
    });
    setFeedback(t('approveTransactionLedger'));
    await ensureTransportOpen();

    const result = await substrateApp.sign(
      LEDGER_DEFAULT_ACCOUNT + index,
      LEDGER_DEFAULT_CHANGE,
      LEDGER_DEFAULT_INDEX + 0,
      u8aToBuffer(payload.toU8a(true))
    );

    setFeedback(t('signedTransactionSuccessfully'));
    await ledgerTransport.current?.device?.close();

    const error = result?.error_message;
    if (error) {
      if (!error.startsWith('No errors')) {
        throw new Error(error);
      }
    }

    if (!(result instanceof Error)) {
      return {
        statusCode: 'SignedPayload',
        device: { id, productName },
        body: {
          uid,
          sig: result.signature,
        },
      };
    }
    return undefined;
  };

  // Handle an incoming new status code and persist to state.
  const handleNewStatusCode = (ack: string, statusCode: LedgerStatusCode) => {
    const newStatusCodes = [{ ack, statusCode }, ...statusCodes];

    // Remove last status code if there are more than allowed number of status codes.
    if (newStatusCodes.length > TOTAL_ALLOWED_STATUS_CODES) {
      newStatusCodes.pop();
    }
    setStateWithRef(newStatusCodes, setStatusCodes, statusCodesRef);
  };

  // Check if a Ledger address exists in imported addresses.
  const ledgerAccountExists = (address: string) =>
    !!getLocalLedgerAccounts().find((a) =>
      isLocalNetworkAddress(network, a, address)
    );

  const addLedgerAccount = (address: string, index: number) => {
    let newLedgerAccounts = getLocalLedgerAccounts();

    const ledgerAddress = getLocalLedgerAddresses().find((a) =>
      isLocalNetworkAddress(network, a, address)
    );

    if (
      ledgerAddress &&
      !newLedgerAccounts.find((a) => isLocalNetworkAddress(network, a, address))
    ) {
      const account = {
        address,
        network,
        name: ledgerAddress.name,
        source: 'ledger',
        index,
      };

      // update the full list of local ledger accounts with new entry.
      newLedgerAccounts = [...newLedgerAccounts].concat(account);
      localStorage.setItem(
        'ledger_accounts',
        JSON.stringify(newLedgerAccounts)
      );

      // store only those accounts on the current network in state.
      setStateWithRef(
        newLedgerAccounts.filter((a) => a.network === network),
        setLedgerAccountsState,
        ledgerAccountsRef
      );

      return account;
    }
    return null;
  };

  const removeLedgerAccount = (address: string) => {
    let newLedgerAccounts = getLocalLedgerAccounts();

    newLedgerAccounts = newLedgerAccounts.filter((a) => {
      if (a.address !== address) {
        return true;
      }
      if (a.network !== network) {
        return true;
      }
      return false;
    });
    if (!newLedgerAccounts.length) {
      localStorage.removeItem('ledger_accounts');
    } else {
      localStorage.setItem(
        'ledger_accounts',
        JSON.stringify(newLedgerAccounts)
      );
    }
    setStateWithRef(
      newLedgerAccounts.filter((a) => a.network === network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );
  };

  // Gets an imported address along with its Ledger metadata.
  const getLedgerAccount = (address: string) => {
    const localLedgerAccounts = getLocalLedgerAccounts();

    if (!localLedgerAccounts) {
      return null;
    }
    return (
      localLedgerAccounts.find((a) =>
        isLocalNetworkAddress(network, a, address)
      ) ?? null
    );
  };

  // Renames an imported ledger account.
  const renameLedgerAccount = (address: string, newName: string) => {
    let newLedgerAccounts = getLocalLedgerAccounts();

    newLedgerAccounts = newLedgerAccounts.map((a) =>
      isLocalNetworkAddress(network, a, address)
        ? {
            ...a,
            name: newName,
          }
        : a
    );
    renameLocalLedgerAddress(address, newName);
    localStorage.setItem('ledger_accounts', JSON.stringify(newLedgerAccounts));
    setStateWithRef(
      newLedgerAccounts.filter((a) => a.network === network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );
  };

  // Renames a record from local ledger addresses.
  const renameLocalLedgerAddress = (address: string, name: string) => {
    const localLedger = (
      localStorageOrDefault('ledger_addresses', [], true) as LedgerAddress[]
    )?.map((i) =>
      !(i.address === address && i.network === network)
        ? i
        : {
            ...i,
            name,
          }
    );
    if (localLedger) {
      localStorage.setItem('ledger_addresses', JSON.stringify(localLedger));
    }
  };

  // Timeout function to prevent hanging tasks. Used for tasks that require no input from the
  // device, such as getting an address that does not require confirmation.
  const withTimeout = (millis: AnyFunction, promise: AnyFunction) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(async () => {
        ledgerTransport.current?.device?.close();
        reject(Error('Timeout'));
      }, millis)
    );
    return Promise.race([promise, timeout]);
  };

  // Helper to update feedback message and status code.
  const updateFeedbackAndStatusCode = ({
    message,
    helpKey,
    code,
  }: {
    message: MaybeString;
    helpKey?: MaybeString;
    code: LedgerStatusCode;
  }) => {
    setFeedback(message, helpKey);
    handleNewStatusCode('failure', code);
  };

  // Helper to reset ledger state when the a overlay connecting to the Ledger device unmounts.
  const handleUnmount = () => {
    // reset refs
    ledgerLoopInProgress.current = false;
    pairInProgress.current = false;
    // reset state
    resetStatusCodes();
    setIsExecuting(false);
    resetFeedback();
    // close transport
    if (getTransport()?.device?.opened) {
      getTransport().device.close();
    }
  };

  // Helper to open ledger transport if it is closed.
  const ensureTransportOpen = async () => {
    if (!ledgerTransport.current?.device?.opened)
      await ledgerTransport.current?.device?.open();
  };

  // Refresh imported ledger accounts on network change.
  useEffect(() => {
    setStateWithRef(
      getLocalLedgerAccounts(network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );
  }, [network]);

  return (
    <LedgerHardwareContext.Provider
      value={{
        pairDevice,
        setIsPaired,
        transportResponse,
        executeLedgerLoop,
        setIsExecuting,
        handleNewStatusCode,
        resetStatusCodes,
        getIsExecuting,
        getStatusCodes,
        getTransport,
        ledgerAccountExists,
        addLedgerAccount,
        removeLedgerAccount,
        renameLedgerAccount,
        getLedgerAccount,
        getFeedback,
        setFeedback,
        resetFeedback,
        handleUnmount,
        isPaired: isPairedRef.current,
        ledgerAccounts: ledgerAccountsRef.current,
      }}
    >
      {children}
    </LedgerHardwareContext.Provider>
  );
};

export const LedgerHardwareContext =
  React.createContext<LedgerHardwareContextInterface>(
    defaultLedgerHardwareContext
  );

export const useLedgerHardware = () => React.useContext(LedgerHardwareContext);
