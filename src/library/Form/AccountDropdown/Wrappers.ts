// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import {
  borderPrimary,
  textPrimary,
  backgroundDropdown,
  textSecondary,
  borderSecondary,
} from 'theme';

export const StyledDownshift = styled.div`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;

  .label {
    margin: 0.25rem 0 0.75rem 0;
  }
  .current {
    flex: 1;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    > span {
      margin: 0 0.75rem;
      color: ${textSecondary};
      opacity: 0.5;
    }
  }

  /* input element of dropdown */
  .input-wrap {
    border-bottom: 1px solid ${borderPrimary};
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    box-sizing: border-box;
    padding: 0.25rem 0 0 0;
    margin: 0.25rem 0.7rem 0 0.7rem;
    flex: 1;

    &.selected {
      border: 1px solid ${borderPrimary};
      border-radius: 1rem;
      margin: 0;
      padding: 0.1rem 0.75rem;
    }
  }

  /* input element of dropdown */
  .input {
    border: none;
    box-sizing: border-box;
    padding-left: 0.75rem;
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const StyledController = styled.button`
  color: ${textPrimary};
  box-sizing: border-box;
  border: none;
  position: absolute;
  right: 0.5rem;
  top: 0.4rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
`;

/* dropdown box for vertical scroll */
export const StyledDropdown = styled.div<{
  height: string | number | undefined;
}>`
  background: ${backgroundDropdown};
  position: relative;
  box-sizing: border-box;
  margin: 0.5rem 0 0;
  border-bottom: none;
  border-radius: 0.75rem;
  z-index: 1;

  .items {
    box-sizing: border-box;
    width: auto;
    height: ${(props) => (props.height ? props.height : 'auto')};
    overflow: auto;

    .item {
      box-sizing: border-box;
      padding: 0.5rem;
      cursor: pointer;
      margin: 0.25rem;
      border-radius: 0.75rem;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-items: center;

      .icon {
        margin-right: 0.5rem;
      }
      span {
        color: ${textSecondary};
        border: 1px solid ${borderSecondary};
        border-radius: 0.5rem;
        padding: 0.2rem 0.5rem;
        font-size: 0.9rem;
        margin-right: 0.5rem;
      }
      p {
        font-size: 1rem;
        color: ${textPrimary};
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        flex: 1;
      }
    }
  }
`;
