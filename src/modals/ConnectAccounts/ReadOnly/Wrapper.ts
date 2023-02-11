// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Wrapper = styled.div`
  background: var(--button-primary-background);
  color: var(--text-color-primary);
  border-radius: 0.75rem;
  width: 100%;
  margin: 1rem 0;
  border-radius: 0.5rem;
  transition: background 0.15s;
  display: flex;
  flex-flow: column nowrap;
  min-height: 3.5rem;

  > .content {
    padding: 0 1rem;
    width: 100%;
  }

  .accounts {
    margin-top: 1rem;
    width: 100%;
  }

  .account {
    border: 1px solid var(--border-primary-color);
    width: 100%;
    border-radius: 0.75rem;
    margin: 1rem 0;
    padding: 1rem;
    display: flex;
    flex-flow: row wrap;
    transition: border 0.1s;

    > div {
      color: var(--text-color-secondary);
      transition: opacity 0.2s;

      &:first-child {
        flex: 1;
        display: flex;
        flex-flow: row wrap;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &:last-child {
        padding-left: 2rem;
        opacity: 0.25;
      }
    }

    &:hover {
      > div:last-child {
        opacity: 1;
      }
    }

    &:hover {
      border-color: var(--border-secondary-color);
    }
  }
`;
