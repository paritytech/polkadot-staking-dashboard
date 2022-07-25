// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { tooltipBackground, textInvert } from 'theme';

export const Wrapper = styled.div`
  background: ${tooltipBackground};
  box-sizing: border-box;
  display: flex;
  flex-flow: column wrap;
  transition: opacity 0.1s;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  min-width: 100px;
  max-width: 200px;

  h3 {
    color: ${textInvert};
    font-size: 0.9rem;
    padding: 0;
    margin: 0;
    text-align: center;
  }
`;
