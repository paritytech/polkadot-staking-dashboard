// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useModal } from 'contexts/Modal';
import { useBalances } from 'contexts/Balances';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { BondInputWithFeedback } from 'library/Form/BondInputWithFeedback';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { useStaking } from 'contexts/Staking';
import { planckBnToUnit, unitToPlanckBn } from 'Utils';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { BondOptions } from 'contexts/Balances/types';
import { NotesWrapper } from '../../Wrappers';
import { FormFooter } from './FormFooter';

export const UnbondSome = (props: any) => {
  const { setSection } = props;

  const { api, network, consts } = useApi();
  const { units } = network;
  const { setStatus: setModalStatus, setResize, config } = useModal();
  const { activeAccount, accountHasSigner } = useConnect();
  const { staking, getControllerNotImported } = useStaking();
  const { getBondOptions, getBondedAccount } = useBalances();
  const { bondType } = config;
  const { stats } = usePoolsConfig();
  const { getPoolBondOptions } = useActivePool();
  const controller = getBondedAccount(activeAccount);
  const controllerNotImported = getControllerNotImported(controller);
  const { minNominatorBond: minNominatorBondBn } = staking;
  const stakeBondOptions: BondOptions = getBondOptions(activeAccount);
  const poolBondOptions = getPoolBondOptions(activeAccount);
  const isStaking = bondType === 'stake';
  const isPooling = bondType === 'pool';
  const { minJoinBond: minJoinBondBn } = stats;
  const { bondDuration } = consts;

  const { freeToUnbond: freeToUnbondBn } = isPooling
    ? poolBondOptions
    : stakeBondOptions;

  // convert BN values to number
  const freeToUnbond = planckBnToUnit(freeToUnbondBn, units);
  const minJoinBond = planckBnToUnit(minJoinBondBn, units);
  const minNominatorBond = planckBnToUnit(minNominatorBondBn, units);
  // local bond value
  const [bond, setBond] = useState({ bond: freeToUnbond });

  // bond valid
  const [bondValid, setBondValid] = useState(false);

  // get the max amount available to unbond
  const freeToUnbondToMin = isPooling
    ? Math.max(freeToUnbond - minJoinBond, 0)
    : Math.max(freeToUnbond - minNominatorBond, 0);

  // unbond some validation
  const isValid = isPooling ? true : !controllerNotImported;

  // update bond value on task change
  useEffect(() => {
    const _bond = freeToUnbondToMin;
    setBond({ bond: _bond });

    setBondValid(isValid);
  }, [freeToUnbondToMin, isValid]);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!bondValid || !api || !activeAccount) {
      return _tx;
    }
    // stake unbond: controller must be imported
    if (isStaking && controllerNotImported) {
      return _tx;
    }
    // remove decimal errors
    const bondToSubmit = unitToPlanckBn(bond.bond, units);

    // determine _tx
    if (isPooling) {
      _tx = api.tx.nominationPools.unbond(activeAccount, bondToSubmit);
    } else if (isStaking) {
      _tx = api.tx.staking.unbond(bondToSubmit);
    }
    return _tx;
  };

  const signingAccount = isPooling ? activeAccount : controller;

  const { submitTx, estimatedFee, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: signingAccount,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(0);
    },
    callbackInBlock: () => {},
  });

  const TxFee = (
    <p>Estimated Tx Fee: {estimatedFee === null ? '...' : `${estimatedFee}`}</p>
  );

  const warnings = [];
  if (!accountHasSigner(activeAccount)) {
    warnings.push('Your account is read only, and cannot sign transactions.');
  }

  return (
    <>
      <div className="items">
        <>
          <BondInputWithFeedback
            bondType={bondType}
            unbond
            listenIsValid={setBondValid}
            defaultBond={freeToUnbondToMin}
            setters={[
              {
                set: setBond,
                current: bond,
              },
            ]}
            warnings={warnings}
          />
          <NotesWrapper>
            <p>
              Once unbonding, you must wait {bondDuration} eras for your funds
              to become available.
            </p>
            {TxFee}
          </NotesWrapper>
        </>
      </div>
      <FormFooter
        setSection={setSection}
        submitTx={submitTx}
        submitting={submitting}
        isValid={bondValid && accountHasSigner(signingAccount)}
      />
    </>
  );
};
