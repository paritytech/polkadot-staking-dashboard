// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useApi } from 'contexts/Api';
import {
  defaultThemes,
  networkColors,
  networkColorsSecondary,
  networkColorsTransparent,
} from 'theme/default';
import { useTheme } from 'contexts/Themes';
import { humanNumber } from 'Utils';
import { useUi } from 'contexts/UI';
import { useStaking } from 'contexts/Staking';
import { AnySubscan } from 'types';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import { useSubscan } from 'contexts/Subscan';
import { useTranslation } from 'react-i18next';
import { PayoutBarProps } from './types';
import { formatRewardsForGraphs } from './Utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const PayoutBar = (props: PayoutBarProps) => {
  const { days, height } = props;

  const { mode } = useTheme();
  const { network } = useApi();
  const { isSyncing } = useUi();
  const { inSetup } = useStaking();
  const { membership } = usePoolMemberships();
  const { payouts, poolClaims } = useSubscan();
  const { t } = useTranslation('common');

  const { units } = network;
  const notStaking = !isSyncing && inSetup() && !membership;
  const average = 1;

  const { payoutsByDay, poolClaimsByDay } = formatRewardsForGraphs(
    days,
    average,
    units,
    payouts,
    poolClaims
  );

  // determine color for payouts
  const colorPayouts = notStaking
    ? networkColorsTransparent[`${network.name}-${mode}`]
    : networkColors[`${network.name}-${mode}`];

  // determine color for poolClaims
  const colorPoolClaims = notStaking
    ? networkColorsTransparent[`${network.name}-${mode}`]
    : networkColorsSecondary[`${network.name}-${mode}`];

  const data = {
    labels: payoutsByDay.map((item: AnySubscan) => {
      return moment.unix(item.block_timestamp).format('LL');
    }),
    datasets: [
      {
        label: t('library.payout'),
        data: payoutsByDay.map((item: AnySubscan) => {
          return item.amount;
        }),
        borderColor: colorPayouts,
        backgroundColor: colorPayouts,
        pointRadius: 0,
        borderRadius: 3,
      },
      {
        label: t('library.pool_claim'),
        data: poolClaimsByDay.map((item: AnySubscan) => {
          return item.amount;
        }),
        borderColor: colorPoolClaims,
        backgroundColor: colorPoolClaims,
        pointRadius: 0,
        borderRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barPercentage: 0.4,
    maxBarThickness: 13,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          drawBorder: true,
        },
        ticks: {
          font: {
            size: 10,
          },
          autoSkip: true,
        },
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: 10,
          },
        },
        grid: {
          color: defaultThemes.graphs.grid[mode],
          borderColor: defaultThemes.transparent[mode],
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: defaultThemes.graphs.tooltip[mode],
        bodyColor: defaultThemes.text.invert[mode],
        bodyFont: {
          weight: '600',
        },
        callbacks: {
          title: () => {
            return [];
          },
          label: (context: any) => {
            return `${humanNumber(context.parsed.y)} ${network.unit}`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        height: height === undefined ? 'auto' : height,
      }}
    >
      <Bar options={options} data={data} />
    </div>
  );
};

export default PayoutBar;
