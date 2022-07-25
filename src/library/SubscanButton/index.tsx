// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { useUi } from 'contexts/UI';
import { useTheme } from 'contexts/Themes';
import { defaultThemes, networkColors } from 'theme/default';
import { useApi } from 'contexts/Api';

const Wrapper = styled.div<{ color: string; opacity: number }>`
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 0.9rem;
  font-variation-settings: 'wght' 570;
  border-radius: 0.3rem;
  padding: 0.25rem 0.4rem;
  color: ${(props) => props.color};
  opacity: ${(props) => props.opacity};
`;

export const SubscanButton = () => {
  const { network } = useApi();
  const { mode } = useTheme();
  const { services } = useUi();

  return (
    <Wrapper
      color={
        services.includes('subscan')
          ? networkColors[`${network.name}-${mode}`]
          : defaultThemes.text.secondary[mode]
      }
      opacity={services.includes('subscan') ? 1 : 0.5}
    >
      <FontAwesomeIcon
        icon={faProjectDiagram}
        transform="shrink-2"
        style={{ marginRight: '0.3rem' }}
      />
      Subscan
    </Wrapper>
  );
};

export default SubscanButton;
