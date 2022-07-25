// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { Identicon as IdenticonDefault } from '@polkadot/react-identicon';
import { backgroundIdenticon } from 'theme';
import { IdenticonProps } from './types';

const Wrapper = styled.div`
  svg > circle:first-child {
    fill: ${backgroundIdenticon};
  }
`;
export const Identicon = (props: IdenticonProps) => {
  const { value, size } = props;

  return (
    <Wrapper>
      <IdenticonDefault
        value={value}
        size={size}
        theme="polkadot"
        style={{ cursor: 'default' }}
      />
    </Wrapper>
  );
};

export default Identicon;
