// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  borderPrimary,
  highlightPrimary,
  highlightSecondary,
  textSecondary,
} from 'theme';
import { MinimisedProps } from '../types';

export const Wrapper = styled(motion.button)<MinimisedProps>`
  width: 100%;
  border: 1px solid ${borderPrimary};
  box-sizing: border-box;
  border-radius: 0.7rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  padding: 0.75rem 0rem 0.75rem 0.5rem;
  margin: 0.55rem 0.2rem 0.55rem 0;
  font-size: 1.04rem;
  position: relative;

  .name {
    color: ${textSecondary};
    font-size: 1rem;
    font-variation-settings: 'wght' 480;
  }
  .light {
    color: ${textSecondary};
    font-size: 0.8rem;
    margin-left: 0.2rem;
    font-variation-settings: 'wght' 480;
  }
  .action {
    color: ${textSecondary};
    flex: 1;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
  }

  &.active {
    background: ${highlightPrimary};
  }
  &.inactive:hover {
    background: ${highlightSecondary};
  }
`;

export const MinimisedWrapper = styled(motion.button)`
  width: 100%;
  border: 1px solid ${borderPrimary};
  border-radius: 0.5rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: 0.6rem 0rem;
  margin: 0.3rem 0 0.3rem 0;
  font-size: 1.04rem;
  position: relative;

  &.active {
    background: ${highlightPrimary};
  }
  &.inactive:hover {
    background: ${highlightSecondary};
  }
  .icon {
    margin: 0;
  }
  .action {
    &.minimised {
      flex: 0;
      position: absolute;
      top: -2px;
      right: -13px;
    }
  }
`;

export const IconWrapper = styled.div<{ minimised: number }>`
  margin-left: ${(props) => (props.minimised ? 0 : '0.25rem')};
  margin-right: 0.65rem;

  svg {
    .primary {
      fill: ${textSecondary};
    }
  }
`;
