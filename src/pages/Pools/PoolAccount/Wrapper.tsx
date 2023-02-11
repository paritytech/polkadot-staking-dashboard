// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Wrapper = styled.div<{ last?: boolean }>`
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
      color: var(--text-color-primary);
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
        color: var(--text-color-secondary);
        cursor: pointer;
        transition: opacity 0.1s;
        margin-left: 0.5rem;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
`;
