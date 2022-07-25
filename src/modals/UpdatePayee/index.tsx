// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleUp } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Dropdown } from 'library/Form/Dropdown';
import { useStaking } from 'contexts/Staking';
import { useBalances } from 'contexts/Balances';
import { useApi } from 'contexts/Api';
import { useModal } from 'contexts/Modal';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { useConnect } from 'contexts/Connect';
import { PAYEE_STATUS } from 'consts';
import { Warning } from 'library/Form/Warning';
import { HeadingWrapper, FooterWrapper, PaddingWrapper } from '../Wrappers';

export const UpdatePayee = () => {
  const { api } = useApi();
  const { activeAccount } = useConnect();
  const { getBondedAccount } = useBalances();
  const { setStatus: setModalStatus } = useModal();
  const controller = getBondedAccount(activeAccount);
  const { staking, getControllerNotImported } = useStaking();
  const { payee } = staking;

  const _selected: any = PAYEE_STATUS.find((item) => item.key === payee);
  const [selected, setSelected]: any = useState(null);

  // reset selected value on account change
  useEffect(() => {
    setSelected(null);
  }, [activeAccount]);

  // ensure selected key is valid
  useEffect(() => {
    const exists = PAYEE_STATUS.find((item) => item.key === selected?.key);
    setValid(exists !== undefined);
  }, [selected]);

  const handleOnChange = ({ selectedItem }: any) => {
    setSelected(selectedItem);
  };

  // bond valid
  const [valid, setValid] = useState<boolean>(false);

  // tx to submit
  const tx = () => {
    let _tx = null;

    if (!api || !valid) {
      return _tx;
    }

    _tx = api.tx.staking.setPayee(selected.key);
    return _tx;
  };

  const { submitTx, estimatedFee, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: controller,
    shouldSubmit: valid,
    callbackSubmit: () => {
      setModalStatus(0);
    },
    callbackInBlock: () => {},
  });

  // remove active payee option from selectable items
  const payeeItems = PAYEE_STATUS.filter((item) => {
    return item.key !== _selected.key;
  });

  return (
    <PaddingWrapper verticalOnly>
      <HeadingWrapper>
        <FontAwesomeIcon transform="grow-2" icon={faWallet} />
        Update Reward Destination
      </HeadingWrapper>
      <div
        style={{
          padding: '0 1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {getControllerNotImported(controller) && (
          <Warning text="You must have your controller account imported to update your reward destination" />
        )}
        <Dropdown
          items={payeeItems}
          onChange={handleOnChange}
          placeholder="Reward Destination"
          value={selected}
          current={_selected}
          height="17rem"
        />
        <div>
          <p>
            Estimated Tx Fee:{' '}
            {estimatedFee === null ? '...' : `${estimatedFee}`}
          </p>
        </div>
        <FooterWrapper>
          <div>
            <button
              type="button"
              className="submit"
              onClick={() => submitTx()}
              disabled={
                !valid || submitting || getControllerNotImported(controller)
              }
            >
              <FontAwesomeIcon
                transform="grow-2"
                icon={faArrowAltCircleUp as IconProp}
              />
              Submit
            </button>
          </div>
        </FooterWrapper>
      </div>
    </PaddingWrapper>
  );
};

export default UpdatePayee;
