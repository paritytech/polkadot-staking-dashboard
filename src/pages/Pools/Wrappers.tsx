// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { textPrimary, textSecondary } from 'theme';

export const AccountWrapper = styled.div<{ last?: boolean }>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  padding-bottom: 0.5rem;
  margin-top: 1.25rem;

  .account {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0;

    button {
      color: ${textPrimary};
    }

    .icon {
      position: relative;
      top: 0.1rem;
      margin-right: 0.5rem;
    }
    h4 {
      margin: 0;
      padding: 0;

      > .addr {
        opacity: 0.75;
      }
    }

    > :last-child {
      display: flex;
      flex-flow: row-reverse wrap;
      margin-left: 0.5rem;

      > .copy {
        color: ${textSecondary};
        opacity: 0.5;
        cursor: pointer;
        transition: opacity 0.1s;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
`;
