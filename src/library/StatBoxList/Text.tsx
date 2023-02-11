// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { OpenHelpIcon } from 'library/OpenHelpIcon';
import { StatBox } from './Item';
import { TextProps } from './types';
import { TextTitleWrapper } from './Wrapper';

export const Text = ({
  label,
  value,
  secondaryValue,
  helpKey,
  primary,
}: TextProps) => {
  const help = helpKey !== undefined;

  return (
    <StatBox>
      <div className="content chart">
        <div className="labels">
          <TextTitleWrapper primary={primary === true}>
            {value}
            {secondaryValue ? <span>{secondaryValue}</span> : null}
          </TextTitleWrapper>
          <h4>
            {label}
            {help && <OpenHelpIcon helpKey={helpKey} />}
          </h4>
        </div>
      </div>
    </StatBox>
  );
};
