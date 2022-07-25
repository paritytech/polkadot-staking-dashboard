// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { textSecondary, networkColor } from 'theme';

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;

  h3 {
    margin-bottom: 0;
  }
`;

export const StakingAccount = styled.div<{ last: boolean }>`
  margin-bottom: ${(props) => (props.last === true ? 'none' : '1rem')};
  display: flex;
  flex-flow: row wrap;
  h4 {
    color: ${textSecondary};
  }
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  > section {
    color: ${textSecondary};
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  > section:last-child {
    flex: 1;
    justify-content: flex-end;

    .progress {
      color: ${textSecondary};
      opacity: 0.5;
    }

    .complete {
      margin: 0;
      color: ${networkColor};
    }

    span {
      margin-right: 1rem;
    }
  }

  h2 {
    margin: 0;
    padding: 0.3rem 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;

    .assistant-icon {
      margin-left: 0.6rem;
    }
  }
`;

export const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0.25rem;
  margin-top: 1rem;
`;

export const Section = styled.div`
  flex: 1;
  display: flex;
  padding-right: 0.5rem;

  &:last-child {
    padding-right: 0;
  }

  > div {
    flex: 1;
    background: white;
    border-radius: 0.75rem;
    margin-right: 1rem;
    padding: 0 1rem;
  }
`;

export const Spacer = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.75rem 0;
`;

export default Wrapper;
