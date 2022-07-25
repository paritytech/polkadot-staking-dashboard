// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  backgroundValidator,
  borderPrimary,
  textSecondary,
  networkColor,
  modalBackground,
} from 'theme';
import { MAX_ASSISTANT_INTERFACE_WIDTH } from 'consts';

export const Wrapper = styled.div<{ format?: string; showStatus?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: ${(props) => (props.format === 'nomination' ? '5.6rem' : '3.2rem')};
  position: relative;
  margin: 0.5rem;

  > .inner {
    background: ${backgroundValidator};
    box-sizing: border-box;
    flex: 1;
    border-radius: 0.75rem;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
    overflow: hidden;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    padding: 0;

    .row {
      box-sizing: border-box;
      flex: 1 0 100%;
      height: 3.2rem;
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-start;
      align-items: center;
      padding: 0 0.5rem;

      &.status {
        height: 2.2rem;
      }
      svg {
        margin: 0;
      }
    }
  }
`;

export const Labels = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  flex: 1 1 100%;
  padding: 0 0 0 0.25rem;
  height: 3.2rem;

  button {
    padding: 0 0.1rem;
    @media (min-width: ${MAX_ASSISTANT_INTERFACE_WIDTH}px) {
      padding: 0 0.2rem;
    }

    color: ${textSecondary};
    &:hover {
      opacity: 0.75;
    }
    &.active {
      color: ${networkColor};
    }
  }

  .label {
    position: relative;
    color: ${textSecondary};
    margin: 0 0.2rem;
    @media (min-width: ${MAX_ASSISTANT_INTERFACE_WIDTH}px) {
      margin: 0 0.3rem;
    }

    &.warning {
      color: #d2545d;
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      padding-right: 0.35rem;
    }
  }
`;

export const OverSubscribedWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  height: 100%;

  .warning {
    margin-right: 0.25rem;
    @media (max-width: 500px) {
      display: none;
    }
  }
`;
export const IdentityWrapper = styled(motion.div)`
  box-sizing: border-box;
  display: flex;
  margin-right: 0.5rem;
  flex-flow: row nowrap;
  align-items: center;
  align-content: center;
  overflow: hidden;
  flex: 1 1 25%;
  position: relative;

  .inner {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }
  h4 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3.2rem;
    line-height: 2rem;
    padding: 0 0 0 0.4rem;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const NominationStatusWrapper = styled.div<{ status: string }>`
  margin-right: 0.35rem;
  padding: 0 0.5rem;

  h5 {
    color: ${(props) => (props.status === 'active' ? 'green' : textSecondary)};
    opacity: ${(props) => (props.status === 'active' ? 1 : 0.5)};
    margin: 0;
    display: flex;
    flex-flow: row nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const SelectWrapper = styled.div`
  margin: 0 0.75rem 0 0.25rem;
  overflow: hidden;
  display: block;
  background: ${modalBackground};
  border-radius: 0.25rem;
  width: 1.1rem;
  height: 1.1rem;
  * {
    cursor: pointer;
    width: 100%;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
  .select-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
`;

export const Separator = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px solid ${borderPrimary};
`;

export const MenuPosition = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  width: 0;
  height: 0;
  opacity: 0;
`;

export const TooltipPosition = styled.div`
  position: absolute;
  top: 0;
  left: 0.75rem;
  width: 0;
  height: 0;
  opacity: 0;
`;

export const TooltipTrigger = styled.div`
  z-index: 1;
  width: 130%;
  height: 130%;
  position: absolute;
  top: -10%;
  left: -10%;
`;

export default Wrapper;
