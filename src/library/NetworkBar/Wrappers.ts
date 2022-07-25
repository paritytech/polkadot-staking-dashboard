// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { textSecondary, backgroundNetworkBar, networkColor } from 'theme';
import { SIDE_MENU_STICKY_THRESHOLD } from 'consts';

export const Wrapper = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.85rem;
  color: #444;
  bottom: 0px;
  left: 0px;
  overflow: hidden;
  background: ${backgroundNetworkBar};
  z-index: 6;
  backdrop-filter: blur(4px);
  position: relative;
  @media (min-width: ${SIDE_MENU_STICKY_THRESHOLD + 1}px) {
    position: fixed;
  }
`;

export const Summary = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  align-content: center;

  /* hide connection status text on small screens */
  .hide-small {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    align-content: center;

    @media (max-width: 600px) {
      display: none;
    }
  }

  a {
    opacity: 0.75;
  }
  p {
    margin: 0 0.25rem;
    font-size: 0.85rem;
  }
  .stat {
    margin: 0 0.25rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  /* left and right sections for each row*/
  > section {
    padding: 0.5rem 0.5rem;
    color: ${textSecondary};

    /* left section */
    &:nth-child(1) {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      flex-grow: 1;
      .network_icon {
        margin-right: 0.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    /* right section */
    &:last-child {
      flex-grow: 1;
      display: flex;
      align-items: center;
      flex-flow: row-reverse wrap;
      button {
        border-radius: 0.4rem;
        padding: 0.25rem 0.5rem;
        color: ${textSecondary};
        font-size: 0.85rem;
      }
      span {
        &.pos {
          color: #3eb955;
        }
        &.neg {
          color: #d2545d;
        }
      }
    }
  }
`;

export const NetworkInfo = styled(motion.div)`
  width: 100%;
  background: ${networkColor};
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-content: flex-end;
  padding: 0.25rem 1rem 1rem 1rem;
  overflow: auto;

  > .row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-content: flex-start;
    align-items: flex-start;

    h2 {
      color: #eee;
      font-size: 1.1rem;
      line-height: 2rem;
      padding: 0 0.25rem;
      margin: 1rem 0;
    }

    > div,
    > button {
      padding: 0.25rem 1.5rem 0.25rem;
      background: rgba(0, 0, 0, 0.1);
      margin-right: 1rem;
      border-radius: 0.5rem;
      padding: 0.5rem 1.25rem;
      display: flex;
      flex-flow: column nowrap;

      &:last-child {
        margin-right: 0;
      }
    }
    h3 {
      margin: 0.25rem 0;
      font-variation-settings: 'wght' 575;
      color: #f1f1f1;
      padding: 0.2rem 0;

      &.val {
        font-size: 0.85rem;
        color: #e6e6e6;
      }
    }
  }

  > .row:first-child > h3 {
    margin-top: 0.5rem;
    border-top: 0;
  }
`;

export const Separator = styled.div`
  border-left: 1px solid ${textSecondary};
  opacity: 0.2;
  margin: 0 0.3rem;
  width: 1px;
  height: 1rem;
`;

export default Wrapper;
