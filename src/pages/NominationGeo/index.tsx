// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next';
import type { PageProps } from 'types';
import { PageTitle } from 'kits/Structure/PageTitle';
import { StatBoxList } from 'library/StatBoxList';
import { useNetwork } from 'contexts/Network';
import { useEffect, useState } from 'react';

import { usePlugins } from 'contexts/Plugins';
import { useActiveAccounts } from 'contexts/ActiveAccounts';

import type { NominatorDetail, ChainMetadata } from './types';
import { PolkawatchApi } from '@polkawatch/ddp-client';
import { PolkaWatchController } from 'controllers/PolkaWatchController';

import { AnalyzedPayouts } from './Stats/AnalyzedPayouts';
import { AnalyzedDays } from './Stats/AnalyzedDays';
import { AnalyzedEras } from './Stats/AnalyzedEras';

import { PageRow } from 'kits/Structure/PageRow';
import { PageHeadingWrapper } from 'kits/Structure/PageHeading/Wrapper';
import { CardHeaderWrapper, CardWrapper } from 'library/Card/Wrappers';
import { PluginLabel } from 'library/PluginLabel';
import { GraphWrapper } from 'library/Graphs/Wrapper';
import { GeoDonut } from 'library/Graphs/GeoDonut';
import { ButtonHelp } from 'kits/Buttons/ButtonHelp';
import { useHelp } from 'contexts/Help';
import { Separator } from 'kits/Structure/Separator';
import { NominationGeoList } from './NominationGeoList';
import { StatusLabel } from 'library/StatusLabel';

export const NominationGeo = ({ page: { key } }: PageProps) => {
  const { activeAccount } = useActiveAccounts();
  const { t } = useTranslation();
  const { openHelp } = useHelp();
  const { network } = useNetwork();
  const { pluginEnabled } = usePlugins();
  const enabled = pluginEnabled('polkawatch');

  // Polkawatch Analytics chain metadata, contains information about how the decentralization is 1
  // computed for this particular blockchain

  const [networkMeta, setNetworkMeta] = useState<ChainMetadata>(
    {} as ChainMetadata
  );

  useEffect(() => {
    if (networkSupported && enabled) {
      const polkaWatchApi = new PolkawatchApi(
        PolkaWatchController.apiConfig(network)
      );
      polkaWatchApi
        .ddpIpfsAboutChain()
        .then((response) => {
          setAnalyticsAvailable(true);
          setNetworkMeta(response.data);
        })
        .catch(() => {
          setNetworkMeta({} as ChainMetadata);
          setAnalyticsAvailable(false);
        });
    } else {
      setNetworkMeta({} as ChainMetadata);
      setAnalyticsAvailable(false);
    }
  }, [network]);

  const [nominationDetail, setNominationDetail] = useState<NominatorDetail>(
    {} as NominatorDetail
  );

  const [analyticsAvailable, setAnalyticsAvailable] = useState<boolean>(true);

  const networkSupported =
    PolkaWatchController.SUPPORTED_NETWORKS.includes(network);

  // Please note that the list of dependencies assume that changing network
  // triggers a change of account also (i.e. different network prefix).
  useEffect(() => {
    if (networkSupported && enabled) {
      const polkaWatchApi = new PolkawatchApi(
        PolkaWatchController.apiConfig(network)
      );
      polkaWatchApi
        .ddpIpfsNominatorDetail({
          lastDays: 30,
          nominator: activeAccount,
        })
        .then((response) => {
          setAnalyticsAvailable(true);
          setNominationDetail(response.data);
        })
        .catch(() => {
          setNominationDetail({} as NominatorDetail);
          setAnalyticsAvailable(false);
        });
    } else {
      setNominationDetail({} as NominatorDetail);
      setAnalyticsAvailable(false);
    }
  }, [activeAccount]);

  return (
    <>
      <PageTitle title={t(key, { ns: 'base' })} />
      <PageRow>
        <PageHeadingWrapper>
          <h3>
            {t('decentralization.howDecentralizedIsYourNomination', {
              ns: 'pages',
            })}
          </h3>
        </PageHeadingWrapper>
      </PageRow>
      <StatBoxList>
        <AnalyzedPayouts data={nominationDetail} />
        <AnalyzedEras meta={networkMeta} />
        <AnalyzedDays />
      </StatBoxList>
      <PageRow>
        <CardWrapper>
          <PluginLabel plugin="polkawatch" />
          <CardHeaderWrapper>
            <h4>
              {t('decentralization.payoutDistribution', { ns: 'pages' })}
              <ButtonHelp
                marginLeft
                onClick={() => openHelp('Nomination Payout Distribution')}
              />
            </h4>
            <h2>
              {t('decentralization.byRegionCountryNetwork', { ns: 'pages' })}
            </h2>
          </CardHeaderWrapper>
          <Separator />
          <div
            style={{
              minHeight: `${350}px`,
              display: 'flex',
              justifyContent: 'space-evenly',
              flexWrap: 'wrap',
            }}
          >
            {!enabled || analyticsAvailable ? (
              <StatusLabel
                status="active_service"
                statusFor="polkawatch"
                title={t('decentralization.polkawatchDisabled', {
                  ns: 'pages',
                })}
              />
            ) : (
              <StatusLabel
                status="no_analytic_data"
                title={
                  networkSupported
                    ? t('decentralization.analyticsNotAvailable', {
                        ns: 'pages',
                      })
                    : t('decentralization.analyticsNotSupported', {
                        ns: 'pages',
                      })
                }
              />
            )}
            <GraphWrapper>
              <GeoDonut
                title={t('rewards')}
                series={nominationDetail.topRegionalDistributionChart}
                height={`${300}px`}
                width={300}
                legendHeight={50}
                maxLabelLen={0}
              />
            </GraphWrapper>
            <GraphWrapper>
              <GeoDonut
                title={t('rewards')}
                series={nominationDetail.topCountryDistributionChart}
                height={`${300}px`}
                width={300}
                legendHeight={50}
                maxLabelLen={10}
              />
            </GraphWrapper>
            <GraphWrapper>
              <GeoDonut
                title={t('rewards')}
                series={nominationDetail.topNetworkDistributionChart}
                height={`${300}px`}
                width={300}
                legendHeight={50}
                maxLabelLen={10}
              />
            </GraphWrapper>
          </div>
        </CardWrapper>
      </PageRow>
      {nominationDetail?.nodeDistributionDetail && (
        <PageRow>
          <CardWrapper>
            <NominationGeoList
              allowMoreCols={true}
              title={t('decentralization.decentralizationPerNomination', {
                ns: 'pages',
              })}
              data={nominationDetail}
            />
          </CardWrapper>
        </PageRow>
      )}
    </>
  );
};
