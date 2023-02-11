// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const OverlayWrapper = styled.div`
  background: var(--overlay-modal-color);
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 9;

  /* content wrapper */
  > div {
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;

    /* click anywhere behind overlay to close */
    .close {
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: 8;
      cursor: default;
    }
  }
`;

export const HeightWrapper = styled.div<{ size: string }>`
  box-shadow: var(--card-shadow) var(--card-shadow-color);
  transition: height 0.5s cubic-bezier(0.1, 1, 0.2, 1);
  width: 100%;
  max-width: ${(props) => (props.size === 'small' ? '500px' : '700px')};
  max-height: 100%;
  border-radius: 1.5rem;
  z-index: 9;
  position: relative;
  overflow: hidden;
`;

export const ContentWrapper = styled.div`
  background: var(--background-modal);
  width: 100%;
  height: auto;
  overflow: hidden;
  position: relative;

  a {
    color: var(--network-color-primary);
  }
  .header {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 1rem 2rem 0 2rem;
  }
  .body {
    padding: 0.5rem 1.5rem 1.25rem 1.5rem;
    h4 {
      margin: 1rem 0;
    }
  }
`;

export const TitleWrapper = styled.div`
  padding: 1.5rem 1rem 0 1rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 0 0.5rem;

    button {
      padding: 0;
    }

    path {
      fill: var(--text-color-primary);
    }

    &:first-child {
      flex-grow: 1;

      > h2 {
        display: flex;
        align-items: center;
        font-family: 'Unbounded', 'sans-serif', sans-serif;
        font-size: 1.3rem;
        margin: 0;

        > button {
          margin-left: 0.85rem;
        }
      }
      > svg {
        margin-right: 0.9rem;
      }
    }
  }
`;

export const FilterListWrapper = styled.div`
  padding-bottom: 0.5rem;

  > .body {
    button:last-child {
      margin-bottom: 0;
    }
  }
`;

export const FilterListButton = styled.button<{ active: boolean }>`
  border: 1px solid
    ${(props) =>
      props.active
        ? 'var(--network-color-stroke)'
        : 'var(--button-primary-background)'};
  background: var(--button-primary-background);
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  border-radius: 1rem;
  padding: 0rem 1rem;
  margin: 1rem 0;
  transition: border 0.1s;

  h4 {
    color: ${(props) =>
      props.active
        ? 'var(--network-color-stroke)'
        : 'var(--text-color-secondary)'};
    font-variation-settings: 'wght' 560;
    transition: color 0.1s;
    margin: 0;
  }

  svg {
    color: ${(props) =>
      props.active
        ? 'var(--network-color-stroke)'
        : 'var(--text-color-secondary)'};
    opacity: ${(props) => (props.active ? 1 : 0.7)};
    transition: color 0.1s;
    margin-left: 0.2rem;
    margin-right: 0.9rem;
  }
`;
