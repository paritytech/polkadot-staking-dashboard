// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon';
import { ellipsisFn } from '@w3ux/utils';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHelp } from 'contexts/Help';
import { CardHeaderWrapper, CardWrapper } from 'library/Card/Wrappers';
import { GeoDonut } from 'library/Graphs/GeoDonut';
import { formatSize } from 'library/Graphs/Utils';
import { GraphWrapper } from 'library/Graphs/Wrapper';
import { useSize } from 'hooks/useSize';
import { Title } from 'library/Modal/Title';
import { StatusLabel } from 'library/StatusLabel';
import { PolkawatchApi, type ValidatorDetail } from '@polkawatch/ddp-client';
import { useOverlay } from 'kits/Overlay/Provider';
import { PluginLabel } from 'library/PluginLabel';
import { usePlugins } from 'contexts/Plugins';
import { useNetwork } from 'contexts/Network';
import { PolkaWatchController } from 'controllers/PolkaWatchController';
import { ButtonHelp } from 'kits/Buttons/ButtonHelp';

export const ValidatorGeo = () => {
  const { t } = useTranslation('modals');
  const { network } = useNetwork();
  const { options } = useOverlay().modal.config;
  const { address, identity } = options;
  const { openHelp } = useHelp();

  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref?.current || undefined);
  const { height, minHeight } = formatSize(size, 300);
  const [pwData, setPwData] = useState<ValidatorDetail>({} as ValidatorDetail);
  const [analyticsAvailable, setAnalyticsAvailable] = useState<boolean>(true);
  const { pluginEnabled } = usePlugins();
  const enabled = pluginEnabled('polkawatch');

  // In Small Screens we will display the most relevant chart.
  // For now, we are not going to complicate the UI.
  const isSmallScreen = window.innerWidth <= 650;
  const chartWidth = '330px';

  const networkSupported =
    PolkaWatchController.SUPPORTED_NETWORKS.includes(network);

  useEffect(() => {
    if (networkSupported && enabled) {
      const polkaWatchApi = new PolkawatchApi(
        PolkaWatchController.apiConfig(network)
      );
      polkaWatchApi
        .ddpIpfsValidatorDetail({
          lastDays: 60,
          validator: address,
          validationType: 'public',
        })
        .then((response) => {
          setAnalyticsAvailable(true);
          setPwData(response.data);
        })
        .catch(() => setAnalyticsAvailable(false));
    } else {
      setAnalyticsAvailable(false);
    }
  }, [address, network]);

  return (
    <>
      <Title title={t('validatorDecentralization')} />
      <div className="header">
        <Polkicon address={address} size={33} />
        <h2>
          &nbsp;&nbsp;
          {identity === null ? ellipsisFn(address) : identity}
        </h2>
      </div>
      <div
        className="body"
        style={{ position: 'relative', marginTop: '0.5rem' }}
      >
        <PluginLabel plugin="polkawatch" />
        <CardWrapper
          className="transparent"
          style={{
            margin: '0 0 0 0.5rem',
            height: 350,
          }}
        >
          <CardHeaderWrapper $withMargin>
            <h4>
              {t('rewardsByCountryAndNetwork')}{' '}
              <ButtonHelp
                marginLeft
                onClick={() => openHelp('Rewards By Country And Network')}
              />
            </h4>
          </CardHeaderWrapper>
          <div
            ref={ref}
            style={{
              minHeight,
              display: 'flex',
              justifyContent: 'space-evenly',
            }}
          >
            {!enabled || analyticsAvailable ? (
              <StatusLabel
                status="active_service"
                statusFor="polkawatch"
                title={t('polkawatchDisabled')}
              />
            ) : (
              <StatusLabel
                status="no_analytic_data"
                title={
                  networkSupported
                    ? t('decentralizationAnalyticsNotAvailable')
                    : t('decentralizationAnalyticsNotSupported')
                }
              />
            )}
            <GraphWrapper
              style={{
                height: `${height}px`,
              }}
            >
              <GeoDonut
                title={t('rewards')}
                series={pwData.topCountryDistributionChart}
                height={`${height}px`}
                width={chartWidth}
                maxLabelLen={10}
              />
            </GraphWrapper>

            <div style={{ display: isSmallScreen ? 'none' : 'block' }}>
              <GraphWrapper
                style={{
                  height: `${height}px`,
                }}
              >
                <GeoDonut
                  title={t('rewards')}
                  series={pwData.topNetworkDistributionChart}
                  height={`${height}px`}
                  width={chartWidth}
                  maxLabelLen={10}
                />
              </GraphWrapper>
            </div>
          </div>
        </CardWrapper>
      </div>
    </>
  );
};
