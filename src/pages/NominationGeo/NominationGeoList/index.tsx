// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faBars,
  faChartPie,
  faExternalLinkAlt,
  faGripVertical,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useTheme } from 'contexts/Themes';
import { Header, List, Wrapper as ListWrapper } from 'library/List';
import { MotionContainer } from 'library/List/MotionContainer';
import { Identity } from 'library/ListItem/Labels/Identity';
import { ItemWrapper } from '../Wrappers';
import type { NomninationGeoListProps } from '../types';
import { NominationGeoListProvider, useNominationGeoList } from './context';
import { useNetwork } from 'contexts/Network';
import { Separator } from 'kits/Structure/Separator';
import { ButtonPrimaryInvert } from 'kits/Buttons/ButtonPrimaryInvert';
import { useStaking } from 'contexts/Staking';
import { useActiveAccounts } from 'contexts/ActiveAccounts';
import { ButtonHelp } from 'kits/Buttons/ButtonHelp';
import { useHelp } from 'contexts/Help';
import { TooltipTrigger } from 'library/ListItem/Wrappers';
import { useTooltip } from 'contexts/Tooltip';
import { useTranslation } from 'react-i18next';

export const NominationGeoList = (props: NomninationGeoListProps) => (
  <NominationGeoListProvider>
    <NominationGeoListInner {...props} />
  </NominationGeoListProvider>
);

export const NominationGeoListInner = ({
  allowMoreCols,
  title,
  data,
}: NomninationGeoListProps) => {
  const { mode } = useTheme();
  const { t } = useTranslation('pages');
  const {
    network,
    networkData: { colors },
  } = useNetwork();
  const { listFormat, setListFormat } = useNominationGeoList();
  const { isNominating } = useStaking();
  const { activeAccount } = useActiveAccounts();
  const { openHelp } = useHelp();
  const { setTooltipTextAndOpen } = useTooltip();

  if (!data?.nodeDistributionDetail) {
    return null;
  }

  const totalRewards = data.nodeDistributionDetail.reduce(
    (acc, n) => acc + n.TokenRewards,
    0
  );

  const tooltipText = t('decentralization.nominationShareInRewards');

  return (
    <>
      <ListWrapper>
        <Header>
          <div>
            <h4>{title}</h4>
            <ButtonHelp
              marginLeft
              onClick={() => openHelp('Geolocation of Each Nomination')}
            />
          </div>
          <div>
            <button type="button" onClick={() => setListFormat('row')}>
              <FontAwesomeIcon
                icon={faBars}
                color={listFormat === 'row' ? colors.primary[mode] : 'inherit'}
              />
            </button>
            <button type="button" onClick={() => setListFormat('col')}>
              <FontAwesomeIcon
                icon={faGripVertical}
                color={listFormat === 'col' ? colors.primary[mode] : 'inherit'}
              />
            </button>
          </div>
        </Header>
        <List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
          <MotionContainer>
            {data.nodeDistributionDetail
              .sort((a, b) => b.TokenRewards - a.TokenRewards)
              .map((n, index: number) => (
                <motion.div
                  className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
                  key={`nomination_${index}`}
                  variants={{
                    hidden: {
                      y: 15,
                      opacity: 0,
                    },
                    show: {
                      y: 0,
                      opacity: 1,
                    },
                  }}
                >
                  <ItemWrapper>
                    <div className="inner">
                      <div className="row">
                        <div>
                          <div>
                            <h4 className="reward">
                              <p>
                                {n.LastNetwork}, {n.LastCountry}, {n.LastRegion}{' '}
                                {n.Countries + n.Regions > 2 ? '++.' : '.'}
                              </p>
                            </h4>
                          </div>
                          <div />
                        </div>
                      </div>
                      <div className="row">
                        <div>
                          <div>
                            <Identity address={n.Id} />
                          </div>
                          <div>
                            <h5>
                              <TooltipTrigger
                                className="tooltip-trigger-element"
                                data-tooltip-text={tooltipText}
                                onMouseMove={() =>
                                  setTooltipTextAndOpen(tooltipText)
                                }
                              />
                              {Math.round(
                                (n.TokenRewards / totalRewards) * 1000
                              ) / 10}{' '}
                              %{' '}
                              <FontAwesomeIcon
                                icon={faChartPie}
                                transform="shrink-1"
                              />
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ItemWrapper>
                </motion.div>
              ))}
          </MotionContainer>
        </List>
      </ListWrapper>
      <Separator />
      <section>
        <ButtonPrimaryInvert
          lg
          onClick={() =>
            window.open(
              `https://${network}.polkawatch.app/nomination/${activeAccount}`,
              '_blank'
            )
          }
          iconRight={faExternalLinkAlt}
          iconTransform="shrink-2"
          text="Polkawatch"
          disabled={
            !(
              activeAccount &&
              ['polkadot', 'kusama'].includes(network) &&
              isNominating()
            )
          }
        />
      </section>
    </>
  );
};
