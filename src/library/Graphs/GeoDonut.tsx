// Copyright 2024 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from 'contexts/Themes';
import { graphColors } from 'theme/graphs';
import chroma from 'chroma-js';
import { ellipsisFn } from '@w3ux/utils';
import { useNetwork } from 'contexts/Network';
import type { GeoDonutProps } from './types';
import type { AnyJson } from '@w3ux/types';

ChartJS.register(ArcElement, Tooltip, Legend);

export const GeoDonut = ({
  title,
  series = { labels: [], data: [] },
  height = 'auto',
  width = 'auto',
  legendHeight = 25,
  maxLabelLen = 3,
}: GeoDonutProps) => {
  const { mode } = useTheme();
  const { colors } = useNetwork().networkData;

  const { labels } = series;
  let { data } = series;
  const isZero = data.length === 0;
  const backgroundColor = isZero
    ? graphColors.inactive[mode]
    : colors.primary[mode];

  const total = data.reduce((acc: number, value: number) => acc + value, 0);

  data = data.map((value: number) => (value / total) * 100);

  const options = {
    borderColor: graphColors.inactive[mode],
    hoverBorderColor: graphColors.inactive[mode],
    backgroundColor,
    hoverBackgroundColor: [backgroundColor, graphColors.inactive[mode]],
    responsive: true,
    maintainAspectRatio: false,
    spacing: 0,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        maxHeight: legendHeight,
        labels: {
          boxWidth: 10,
          generateLabels: (chart: AnyJson) => {
            const ls =
              ChartJS.overrides.doughnut.plugins.legend.labels.generateLabels(
                chart
              );
            return ls.map((l) => {
              l.text =
                maxLabelLen && l.text.length > maxLabelLen
                  ? ellipsisFn(l.text, maxLabelLen, 'end')
                  : l.text;
              return l;
            });
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: AnyJson) => ` ${title}: ${context.raw.toFixed(1)} %`,
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        // We make a gradient of N+2 colors from active to inactive, and we discard both ends N is
        // the number of datapoints to plot.
        backgroundColor: chroma
          .scale([backgroundColor, graphColors.inactive[mode]])
          .colors(data.length + 1),
        borderWidth: 0.5,
      },
    ],
  };

  return (
    <div style={{ width, height }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};
