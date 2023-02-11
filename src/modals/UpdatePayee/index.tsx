// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowAltCircleUp } from '@fortawesome/free-regular-svg-icons';
import { ButtonSubmit } from '@rossbulat/polkadot-dashboard-ui';
import { useApi } from 'contexts/Api';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { PayeeConfig, PayeeOptions } from 'contexts/Setup/types';
import { useStaking } from 'contexts/Staking';
import { useTxFees } from 'contexts/TxFees';
import { Warning } from 'library/Form/Warning';
import { PayeeItem, usePayeeConfig } from 'library/Hooks/usePayeeConfig';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Title } from 'library/Modal/Title';
import { PayeeInput } from 'library/PayeeInput';
import { SelectItems } from 'library/SelectItems';
import { SelectItem } from 'library/SelectItems/Item';
import { SubmitTx } from 'library/SubmitTx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaybeAccount } from 'types';
import { PaddingWrapper, WarningsWrapper } from '../Wrappers';

export const UpdatePayee = () => {
  const { t } = useTranslation('modals');
  const { api } = useApi();
  const { activeAccount } = useConnect();
  const { getBondedAccount } = useBalances();
  const { setStatus: setModalStatus } = useModal();
  const controller = getBondedAccount(activeAccount);
  const { staking, getControllerNotImported } = useStaking();
  const { txFeesValid } = useTxFees();
  const { getPayeeItems } = usePayeeConfig();
  const { payee } = staking;

  const DefaultSelected: PayeeConfig = {
    destination: null,
    account: null,
  };

  // Store the current user-inputted custom payout account.
  const [account, setAccount] = useState<MaybeAccount>(payee.account);

  // Store the currently selected payee option.
  const [selected, setSelected]: any = useState<PayeeConfig>(DefaultSelected);

  // update setup progress with payee config.
  const handleChangeDestination = (destination: PayeeOptions) => {
    setSelected({ destination, account });
  };

  // update setup progress with payee account.
  const handleChangeAccount = (newAccount: MaybeAccount) => {
    setSelected({
      destination: selected?.destination ?? null,
      account: newAccount,
    });
  };

  // determine whether this section is completed.
  const isComplete = () =>
    selected.destination !== null &&
    !(selected.destination === 'Account' && selected.account === null);

  // Tx to submit.
  const getTx = () => {
    let tx = null;

    if (!api || !isComplete()) {
      return tx;
    }
    tx = api.tx.staking.setPayee(selected.destination);
    return tx;
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: getTx(),
    from: controller,
    shouldSubmit: isComplete(),
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  // Reset selected value on account change.
  useEffect(() => {
    setSelected(DefaultSelected);
  }, [activeAccount]);

  // Inject default value after component mount.
  useEffect(() => {
    const initialSelected = getPayeeItems(true).find(
      (item) => item.value === payee.destination
    );
    setSelected(
      initialSelected
        ? {
            destination: initialSelected.value,
            account,
          }
        : DefaultSelected
    );
  }, []);

  // Ensure selected item is valid on change.
  useEffect(() => {}, [selected]);

  return (
    <>
      <Title
        title={t('updatePayoutDestination')}
        helpKey="Payout Destination"
      />
      <PaddingWrapper style={{ paddingBottom: 0 }}>
        {getControllerNotImported(controller) && (
          <WarningsWrapper noMargin>
            <Warning text={t('mustHaveControllerUpdate')} />
          </WarningsWrapper>
        )}
        <div style={{ width: '100%', padding: '0 0.5rem' }}>
          <PayeeInput
            payee={selected}
            account={account}
            setAccount={setAccount}
            handleChange={handleChangeAccount}
          />
        </div>
        <SelectItems>
          {getPayeeItems(true).map((item: PayeeItem) => (
            <SelectItem
              key={`payee_option_${item.value}`}
              account={account}
              setAccount={setAccount}
              selected={selected.destination === item.value}
              onClick={() => handleChangeDestination(item.value)}
              {...item}
            />
          ))}
        </SelectItems>
      </PaddingWrapper>
      <SubmitTx
        fromController
        buttons={[
          <ButtonSubmit
            key="button_submit"
            text={`${submitting ? t('submitting') : t('submit')}`}
            iconLeft={faArrowAltCircleUp}
            iconTransform="grow-2"
            onClick={() => submitTx()}
            disabled={
              !isComplete() ||
              submitting ||
              getControllerNotImported(controller) ||
              !txFeesValid
            }
          />,
        ]}
      />
    </>
  );
};
