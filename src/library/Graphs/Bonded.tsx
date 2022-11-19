// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useApi } from 'contexts/Api';
import { useLocale } from 'contexts/Locale';
import { useTheme } from 'contexts/Themes';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { defaultThemes, networkColors } from 'theme/default';
import { humanNumber } from 'Utils';
import { BondedProps } from './types';
import { GraphWrapper } from './Wrappers';

ChartJS.register(ArcElement, Tooltip, Legend);

export const Bonded = ({
  active,
  free,
  unlocking,
  unlocked,
  inactive,
}: BondedProps) => {
  const { mode } = useTheme();
  const { network } = useApi();
  const { t } = useTranslation('common');
  const { locale } = useLocale();

  // graph data
  let graphActive = active;
  let graphUnlocking = unlocking + unlocked;
  let graphFree = free;

  let zeroBalance = false;
  if (inactive) {
    graphActive = -1;
    graphUnlocking = -1;
    graphFree = -1;
    zeroBalance = true;
  }

  const options = {
    locale,
    responsive: true,
    maintainAspectRatio: false,
    spacing: zeroBalance ? 0 : 2,
    plugins: {
      legend: {
        padding: {
          right: 20,
        },
        display: true,
        position: 'left' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          color: defaultThemes.text.primary[mode],
          font: {
            size: 13,
            weight: '600',
          },
        },
      },
      tooltip: {
        displayColors: false,
        backgroundColor: defaultThemes.graphs.tooltip[mode],
        bodyColor: defaultThemes.text.invert[mode],
        bodyFont: {
          weight: '600',
        },
        callbacks: {
          label: (context: any) => {
            if (inactive) {
              return `${t('library.inactive')}`;
            }
            return `${
              context.parsed === -1 ? 0 : humanNumber(context.parsed)
            } ${network.unit}`;
          },
        },
      },
    },
    cutout: '75%',
  };
  const _colors = zeroBalance
    ? [
        defaultThemes.graphs.colors[1][mode],
        defaultThemes.graphs.inactive2[mode],
        defaultThemes.graphs.inactive[mode],
      ]
    : [
        networkColors[`${network.name}-${mode}`],
        defaultThemes.graphs.colors[0][mode],
        defaultThemes.graphs.colors[1][mode],
      ];

  const data = {
    labels: [t('library.active1'), t('library.unlocking'), t('library.free')],
    datasets: [
      {
        label: network.unit,
        data: [graphActive, graphUnlocking, graphFree],
        backgroundColor: _colors,
        borderWidth: 0,
      },
    ],
  };

  return (
    <GraphWrapper
      transparent
      noMargin
      style={{ border: 'none', boxShadow: 'none' }}
    >
      <div
        className="graph"
        style={{
          flex: 0,
          paddingRight: '1rem',
          height: 160,
        }}
      >
        <Doughnut options={options} data={data} />
      </div>
    </GraphWrapper>
  );
};

export default Bonded;
