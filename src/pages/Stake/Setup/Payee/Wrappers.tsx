// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import {
  backgroundToggle,
  textPrimary,
  networkColor,
  textSecondary,
} from 'theme';

export const Items = styled.div`
  position: relative;
  box-sizing: border-box;
  margin: 0.75rem 0 0;
  width: 100%;
  border-radius: 0.75rem;
  padding: 0.25rem;
  overflow: auto;
  display: flex;
  flex-flow: row wrap;
  flex: 1;
`;

export const Item = styled.button<{ selected?: boolean }>`
  background: ${backgroundToggle};
  border: 2px solid
    ${(props) => (props.selected ? networkColor : backgroundToggle)};
  box-sizing: border-box;
  width: 240px;
  height: 120px;
  padding: 1.25rem;
  margin: 0.25rem;
  border-radius: 0.75rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;

  > div {
    width: 100%;
  }
  h3 {
    color: ${(props) => (props.selected ? networkColor : textPrimary)};
    font-size: 1.2rem;
  }
  &:first-child {
    margin-left: 0rem;
  }
  &:last-child {
    margin-right: 0rem;
  }
  p {
    color: ${textSecondary};
    margin-top: 0.4rem;
    text-align: left;
  }
`;
