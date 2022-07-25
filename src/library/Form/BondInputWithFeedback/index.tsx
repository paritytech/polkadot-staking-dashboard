// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useBalances } from 'contexts/Balances';
import { useStaking } from 'contexts/Staking';
import { humanNumber, planckBnToUnit } from 'Utils';
import { CardHeaderWrapper } from 'library/Graphs/Wrappers';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import BN from 'bn.js';
import { BondInput } from '../BondInput';
import { Spacer } from '../Wrappers';
import { Warning } from '../Warning';
import { BondInputWithFeedbackProps } from '../types';

export const BondInputWithFeedback = (props: BondInputWithFeedbackProps) => {
  // input props
  const { bondType, defaultBond, unbond } = props;
  const nominating = props.nominating ?? false;
  const warnings = props.warnings ?? [];

  // functional props
  const setters = props.setters ?? [];
  const listenIsValid = props.listenIsValid ?? (() => {});

  const { network } = useApi();
  const { activeAccount } = useConnect();
  const { staking, getControllerNotImported } = useStaking();
  const { getLedgerForStash, getBondedAccount, getBondOptions } = useBalances();
  const { getPoolBondOptions } = useActivePool();
  const { stats } = usePoolsConfig();
  const { minJoinBond } = stats;
  const { units } = network;
  const controller = getBondedAccount(activeAccount);
  const ledger = getLedgerForStash(activeAccount);
  const { active } = ledger;
  const { minNominatorBond } = staking;

  // get bond options for either staking or pooling.
  const options =
    bondType === 'pool'
      ? getPoolBondOptions(activeAccount)
      : getBondOptions(activeAccount);

  const {
    freeToBond: freeToBondBn,
    freeToUnbond: freeToUnbondBn,
    active: poolsActive,
  } = options;
  const freeToBond = planckBnToUnit(freeToBondBn, units);

  const minBondBase =
    bondType === 'pool'
      ? planckBnToUnit(minJoinBond, units)
      : planckBnToUnit(minNominatorBond, units);

  // unbond amount to `minNominatorBond` threshold for staking,
  // and unbond amount to `minJoinBond` for pools.
  const freeToUnbondToMin =
    bondType === 'pool'
      ? planckBnToUnit(
          BN.max(freeToUnbondBn.sub(minJoinBond), new BN(0)),
          units
        )
      : planckBnToUnit(
          BN.max(freeToUnbondBn.sub(minNominatorBond), new BN(0)),
          units
        );

  // get the actively bonded amount.
  const activeBase =
    bondType === 'pool'
      ? planckBnToUnit(poolsActive, units)
      : planckBnToUnit(active, units);

  // store errors
  const [errors, setErrors]: any = useState([]);

  // local bond state
  const [bond, setBond]: any = useState({
    bond: defaultBond,
  });

  // whether bond is disabled
  const [bondDisabled, setBondDisabled] = useState(false);

  // add this setBond to setters
  setters.push({
    set: setBond,
    current: bond,
  });

  // update bond on account change
  useEffect(() => {
    setBond({
      bond: defaultBond,
    });
  }, [activeAccount]);

  // handle errors on input change
  useEffect(() => {
    handleErrors();
  }, [bond]);

  // handle error updates
  const handleErrors = () => {
    let _bondDisabled = false;
    const _errors = warnings;

    // bond errors
    if (!unbond) {
      if (freeToBond === 0) {
        _bondDisabled = true;
        _errors.push(`You have no free ${network.unit} to bond.`);
      }

      if (bond.bond !== '' && bond.bond > freeToBond) {
        _errors.push('Bond amount is more than your free balance.');
      }

      // bond errors
      if (nominating) {
        if (freeToBond < minBondBase) {
          _bondDisabled = true;
          _errors.push(
            `You do not meet the minimum bond of ${minBondBase} ${network.unit}.`
          );
        }

        if (bond.bond !== '' && bond.bond < minBondBase) {
          _errors.push(
            `Bond amount must be at least ${minBondBase} ${network.unit}.`
          );
        }
      }
    }

    // unbond errors
    if (unbond) {
      if (bond.bond !== '' && bond.bond > activeBase) {
        _errors.push('Unbond amount is more than your bonded balance.');
      }

      // unbond errors for staking only
      if (bondType === 'stake') {
        if (getControllerNotImported(controller)) {
          _errors.push(
            'You must have your controller account imported to unbond.'
          );
        }
      }

      if (bond.bond !== '' && bond.bond > freeToUnbondToMin) {
        _errors.push(
          `A minimum bond of ${minBondBase} ${network.unit} is required when ${
            bondType === 'stake' ? `actively nominating` : `in your pool`
          }.`
        );
      }
    }
    const bondValid = !_errors.length && bond.bond !== '';

    setBondDisabled(_bondDisabled);
    listenIsValid(bondValid);
    setErrors(_errors);
  };

  return (
    <>
      <CardHeaderWrapper>
        <h4>
          {unbond ? 'Bonded' : 'Available'}:{' '}
          {unbond ? humanNumber(activeBase) : humanNumber(freeToBond)}{' '}
          {network.unit}
        </h4>
      </CardHeaderWrapper>
      {errors.map((err: any, index: number) => (
        <Warning key={`setup_error_${index}`} text={err} />
      ))}
      <Spacer />
      <BondInput
        task={unbond ? 'unbond' : 'bond'}
        value={bond.bond}
        defaultValue={defaultBond}
        disabled={bondDisabled}
        setters={setters}
        freeToBond={freeToBond}
        freeToUnbondToMin={freeToUnbondToMin}
      />
    </>
  );
};

export default BondInputWithFeedback;
