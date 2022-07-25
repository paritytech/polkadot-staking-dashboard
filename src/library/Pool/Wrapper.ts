// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  backgroundValidator,
  borderSecondary,
  textSecondary,
  networkColor,
} from 'theme';

export const Wrapper = styled(motion.div)`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  height: 3.2rem;
  position: relative;
  padding: 0.5rem;
  margin: 0.5rem;

  > div {
    background: ${backgroundValidator};
    box-sizing: border-box;
    padding: 0.6rem;
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

    h3 {
      margin: 0 0.75rem;
      border-right: 1px solid ${borderSecondary};
      padding-right: 1rem;
    }

    .identity {
      position: relative;
      display: flex;
      margin-left: 0.75rem;
      margin-right: 0.5rem;
      flex-flow: row wrap;
      align-items: center;
      align-content: center;
      overflow: hidden;
      flex: 1;

      h4 {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .labels {
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-end;
      align-items: center;
      flex-grow: 1;
      flex-flow: row nowrap;

      .join {
        color: ${networkColor};
      }

      .label {
        color: ${textSecondary};
        display: flex;
        align-items: center;
        margin-left: 1rem;
        .icon {
          margin-right: 0.4rem;
        }
        &.warning {
          color: #d2545d;
          display: flex;
          flex-flow: row wrap;
          align-items: center;
        }
        button {
          color: ${textSecondary};
          &:hover {
            opacity: 0.75;
          }
          &.active {
            color: ${networkColor};
          }
          &:disabled {
            opacity: 0.25;
          }
        }
      }
    }

    svg {
      margin: 0;
    }
  }
`;

export default Wrapper;
