// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const CallToActionWrapper = styled.div`
  --button-border-radius: 2rem;
  --button-vertical-space: 1.1rem;

  height: inherit;
  width: 100%;

  > .inner {
    flex: 1;
    display: flex;
    flex-direction: row;
    margin-top: 0.38rem;

    @media (max-width: 650px) {
      flex-wrap: wrap;
    }

    > section {
      display: flex;
      flex-direction: row;
      height: inherit;

      @media (max-width: 650px) {
        margin-top: var(--button-vertical-space);
        flex-grow: 1;
        flex-basis: 100%;

        &:nth-child(1) {
          margin-top: 0;
        }
      }

      &:nth-child(1) {
        flex-grow: 1;

        @media (min-width: 651px) {
          border-right: 1px solid var(--border-primary-color);
          padding-right: 1rem;
        }
      }

      &:nth-child(2) {
        flex: 1;

        @media (min-width: 651px) {
          padding-left: 1rem;
        }
      }

      &.standalone {
        border: none;
        padding: 0;
      }

      h3 {
        line-height: 1.4rem;
      }

      .buttons {
        border: 0.75px solid var(--border-primary-color);
        border-radius: var(--button-border-radius);
        display: flex;
        flex-wrap: nowrap;
        width: 100%;

        @media (max-width: 650px) {
          flex-wrap: wrap;
        }

        > .button {
          height: 3.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          white-space: nowrap;
          overflow: hidden;
          transition: filter 0.15s;

          &.primary {
            background-color: var(--accent-color-primary);
            border-top-left-radius: var(--button-border-radius);
            border-bottom-left-radius: var(--button-border-radius);
            color: white;
            flex-grow: 1;

            &:hover {
              filter: brightness(90%);
            }
          }

          &.secondary {
            background-color: var(--button-primary-background);
            border-top-right-radius: var(--button-border-radius);
            border-bottom-right-radius: var(--button-border-radius);
            color: var(--text-color-primary);

            &:hover {
              filter: brightness(95%);
            }
          }

          &.standalone {
            border-radius: var(--button-border-radius);
            flex-grow: 1;
          }

          @media (max-width: 650px) {
            border-radius: var(--button-border-radius);
            margin-top: var(--button-vertical-space);
            flex-grow: 1;
            flex-basis: 100%;

            &:nth-child(1) {
              margin-top: 0;
            }
          }

          > button {
            color: inherit;
            height: inherit;
            transition: transform 0.25s;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: nowrap;
            width: 100%;

            > svg {
              margin: 0 0.75rem;
            }
          }
        }
      }
    }
  }
`;