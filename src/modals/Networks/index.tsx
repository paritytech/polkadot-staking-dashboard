// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, Fragment } from 'react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NETWORKS } from 'config/networks';
import { useApi } from 'contexts/Api';
import { useModal } from 'contexts/Modal';
import { PaddingWrapper } from '../Wrappers';
import { ContentWrapper } from './Wrapper';

export const Networks = () => {
  const { switchNetwork, network, isLightClient } = useApi();
  const { setStatus } = useModal();

  return (
    <PaddingWrapper>
      <h2>Switch Network</h2>
      <ContentWrapper>
        <div className="items">
          {Object.entries(NETWORKS).map(([key, item]: any, index: number) => {
            const Svg = item.brand.inline.svg;

            const disabledNetworkButton =
              network.name.toLowerCase() === key && !isLightClient;
            const disabledLCButton =
              network.name.toLowerCase() === key && isLightClient;

            return (
              <Fragment key={`network_${index}`}>
                <button
                  disabled={disabledNetworkButton}
                  key={`network_switch_${index}`}
                  type="button"
                  className={`action-button 
                  ${
                    item.lightClientEndpoint
                      ? 'w-light-client'
                      : 'wo-light-client'
                  } ${disabledLCButton ? ' disabled' : ''}`}
                  onClick={() => {
                    if (
                      network.name.toLowerCase() !== key ||
                      (network.name.toLowerCase() === key && isLightClient)
                    ) {
                      switchNetwork(key, false);
                      setStatus(0);
                    }
                  }}
                >
                  <div style={{ width: '1.75rem' }}>
                    <Svg
                      width={item.brand.inline.size}
                      height={item.brand.inline.size}
                    />
                  </div>
                  <h3>{item.name}</h3>

                  <div>
                    <FontAwesomeIcon
                      transform="shrink-2"
                      icon={faChevronRight}
                    />
                  </div>
                </button>
                {/* This is the Light Client button */}
                {item.lightClientEndpoint ? (
                  <button
                    disabled={disabledLCButton}
                    type="button"
                    className={`action-button light-client ${
                      disabledLCButton ? 'disabled' : ''
                    }`}
                    key={`switch_network_${index}_lc`}
                    onClick={() => {
                      if (
                        network.name.toLowerCase() !== key ||
                        (network.name.toLowerCase() === key && !isLightClient)
                      ) {
                        switchNetwork(key, true);
                        setStatus(0);
                      }
                    }}
                  >
                    <h3>Light Client</h3>
                    <div>
                      <FontAwesomeIcon
                        transform="shrink-2"
                        icon={faChevronRight}
                      />
                    </div>
                  </button>
                ) : null}
                {Object.entries(NETWORKS).length - 1 !== index && <span />}
              </Fragment>
            );
          })}
        </div>
      </ContentWrapper>
    </PaddingWrapper>
  );
};

export default Networks;
