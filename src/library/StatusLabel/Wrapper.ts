// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { backgroundLabel, textSecondary } from 'theme';

export const Wrapper = styled.div<{ topOffset?: string }>`
  position: absolute;
  top: ${(props) => (props.topOffset ? props.topOffset : '50%')};
  left: 0;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  z-index: 2;

  > div {
    background: ${backgroundLabel};
    opacity: 0.75;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    > svg {
      color: ${textSecondary};
    }
    h2 {
      padding: 0;
      margin: 0;
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      font-size: 1.2rem;
      opacity: 0.75;
    }
  }
`;
