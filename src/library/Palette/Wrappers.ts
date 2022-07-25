// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { FLOATING_MENU_WIDTH } from 'consts';
import {
  backgroundPrimary,
  borderPrimary,
  textSecondary,
  shadowColor,
} from 'theme';

export const Wrapper = styled.div`
  background: ${backgroundPrimary};
  box-sizing: border-box;
  border-radius: 1.25rem;
  width: ${FLOATING_MENU_WIDTH}px;
  padding: 1rem;
  display: flex;
  flex-flow: column wrap;
  transition: opacity 0.1s;
  box-shadow: 3px 3px 20px ${shadowColor};

  h4 {
    color: ${textSecondary};
    margin: 0 0 0.5rem 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;

export const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin-bottom: 1rem;

  button {
    position: relative;
    color: ${textSecondary};
    transition: color 0.2s;
    margin: 0 0.25rem;
    opacity: 0.75;
    border: 2px solid ${borderPrimary};
    background: none;
    border-radius: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    padding: 0;

    svg {
      padding: 0;
      margin: 0;
    }

    path {
      fill: ${textSecondary};
    }
    &:hover {
      opacity: 1;
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
      background: ${borderPrimary};
    }
  }
`;
