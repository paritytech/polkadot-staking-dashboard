// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  defaultThemes,
  networkColors,
  networkColorsTransparent,
} from 'theme/default';
import { useTheme } from 'contexts/Themes';
import { useApi } from 'contexts/Api';
import { StatPieProps } from './types';

ChartJS.register(ArcElement, Tooltip);

export const StatPie = (props: StatPieProps) => {
  let { value, value2 } = props;

  // format zero value graph
  const isZero = !value && !value;
  if (isZero) {
    value = 1;
    value2 = 0;
  }

  const { network } = useApi();
  const { mode } = useTheme();

  const borderColor = isZero
    ? defaultThemes.buttons.toggle.background[mode]
    : [
        networkColors[`${network.name}-${mode}`],
        defaultThemes.transparent[mode],
      ];

  const backgroundColor = isZero
    ? defaultThemes.buttons.toggle.background[mode]
    : networkColorsTransparent[`${network.name}-${mode}`];

  const options = {
    borderColor,
    hoverBorderColor: borderColor,
    backgroundColor,
    hoverBackgroundColor: [
      networkColorsTransparent[`${network.name}-${mode}`],
      defaultThemes.transparent[mode],
    ],
    responsive: true,
    maintainAspectRatio: false,
    spacing: 0,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const data = {
    datasets: [
      {
        data: [value, value2],
        backgroundColor: [
          networkColorsTransparent[`${network.name}-${mode}`],
          defaultThemes.transparent[mode],
        ],
        borderWidth: 1.6,
      },
    ],
  };

  return (
    <div className="graph" style={{ width: 36, height: 36 }}>
      <Pie options={options} data={data} />
    </div>
  );
};

export default StatPie;
