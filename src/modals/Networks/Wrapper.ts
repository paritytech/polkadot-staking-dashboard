// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import {
  backgroundToggle,
  buttonDisabledBackground,
  buttonDisabledText,
  buttonPrimaryBackground,
  textPrimary,
  textSecondary,
} from 'theme';

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;

  h2 {
    margin-top: 0.5rem;
    color: ${textPrimary};
  }
`;

export const ContentWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;

  .items {
    box-sizing: border-box;
    position: relative;
    box-sizing: border-box;
    padding: 0.5rem 0;
    border-bottom: none;
    width: auto;
    border-radius: 0.75rem;
    overflow: hidden;
    overflow-y: auto;
    z-index: 1;
    width: 100%;

    h4 {
      margin: 0.2rem 0;
    }
    h2 {
      margin: 0.75rem 0;
    }

    .wo-light-client {
      width: 100%;
    }

    .w-light-client {
      width: 60%;
    }

    .light-client {
      width: 40%;
    }

    button:disabled,
    button[disabled] .action-button {
      background-color: ${buttonDisabledBackground};
      cursor: default;
      h3 {
        color: ${buttonDisabledText};
      }
      svg {
        fill: ${buttonDisabledText};
      }
      &:hover {
        background: ${buttonDisabledBackground};
      }
    }

    .disabled {
      background-color: yellow;
    }

    .action-button {
      background: ${buttonPrimaryBackground};
      box-sizing: border-box;
      padding: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
      border-radius: 0.75rem;
      display: inline-flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-items: center;
      transition: all 0.15s;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        margin: 0 0.5rem 0 0.75rem;
      }
      > *:last-child {
        flex: 1;
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-end;
      }
      &:hover {
        background: ${backgroundToggle};
      }
      .icon {
        margin-right: 0.5rem;
      }

      svg {
        fill: ${textSecondary};
      }
      p {
        color: ${textPrimary};
        font-size: 1rem;
      }
    }
  }
`;
