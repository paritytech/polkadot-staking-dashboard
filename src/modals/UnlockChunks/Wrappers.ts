// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { textSecondary, buttonPrimaryBackground } from 'theme';

export const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const FixedContentWrapper = styled.div`
  box-sizing: border-box;
  padding-top: 1rem;
  flex-basis: 50%;
`;

export const CardsWrapper = styled(motion.div)`
  box-sizing: border-box;
  width: 200%;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  overflow-y: auto;
  position: relative;
  height: 100%;
`;

export const ContentWrapper = styled.div`
  box-sizing: border-box;
  border-radius: 1rem;
  display: flex;
  flex-flow: column nowrap;
  flex-basis: 50%;
  flex: 1;
  padding: 0 1rem;
`;

export const ChunkWrapper = styled.div<{ noFill?: boolean }>`
  flex: 1;
  display: flex;
  flex-flow: column wrap;
  margin: 1rem 0;

  > div {
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
    padding: 0 0.5rem;

    > section {
      display: flex;
      flex-flow: column wrap;
      justify-content: flex-end;
      align-items: flex-start;
      padding: 0.5rem 0;

      &:first-child {
        flex-grow: 1;
      }
    }
  }

  h2 {
    margin: 0.75rem 0 0 0;
  }
  h3 {
    color: ${textSecondary};
    margin: 1rem 0 0 0;
  }
  h4 {
    background: ${(props) =>
      !props.noFill ? buttonPrimaryBackground : 'none'};
    padding: ${(props) => (!props.noFill ? '0.5rem' : '0 0.5rem')};
    color: ${textSecondary};
    box-sizing: border-box;
    margin: 0;
    width: 100%;
    border-radius: 0.75rem;
  }
`;

export default Wrapper;
