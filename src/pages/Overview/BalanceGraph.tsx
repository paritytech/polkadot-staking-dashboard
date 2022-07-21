// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { useApi } from 'contexts/Api';
import { useUi } from 'contexts/UI';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import {
  usdFormatter,
  planckBnToUnit,
  humanNumber,
  toFixedIfNecessary,
} from 'Utils';
import {
  useSize,
  formatSize,
  getLabelFontsizeChart,
} from 'library/Graphs/Utils';
import {
  defaultThemes,
  networkColors,
  networkColorsSecondary,
} from 'theme/default';
import { useTheme } from 'contexts/Themes';
import { usePrices } from 'library/Hooks/usePrices';
import { OpenAssistantIcon } from 'library/OpenAssistantIcon';
import { BondOptions } from 'contexts/Balances/types';

ChartJS.register(ArcElement, Tooltip, Legend);

export const BalanceGraph = () => {
  const { mode } = useTheme();
  const { network } = useApi();
  const { units, features } = network;
  const { activeAccount } = useConnect();
  const { getAccountBalance, getBondOptions } = useBalances();
  const balance = getAccountBalance(activeAccount);
  const { services } = useUi();
  const prices = usePrices();
  const {
    freeToBond,
    freeToUnbond: staked,
    totalUnlocking,
    totalUnlocked,
  }: BondOptions = getBondOptions(activeAccount) || {};
  const { getPoolBondOptions } = useActivePool();

  const poolBondOpions = getPoolBondOptions(activeAccount);
  const unlocking = poolBondOpions.totalUnlocking
    .add(poolBondOpions.totalUnlocked)
    .add(totalUnlocked)
    .add(totalUnlocking);

  const { free } = balance;

  // get user's total free balance
  const freeBase = planckBnToUnit(free, units);

  // convert balance to fiat value
  const freeBalance = toFixedIfNecessary(
    Number(freeBase * prices.lastPrice),
    2
  );

  // graph data
  let graphStaked = planckBnToUnit(staked, units);
  let graphFreeToStake = planckBnToUnit(freeToBond, units);
  let graphInPool = planckBnToUnit(poolBondOpions.active, units);
  let graphUnlocking = planckBnToUnit(unlocking, units);

  let zeroBalance = false;
  if (
    graphStaked === 0 &&
    graphFreeToStake === 0 &&
    graphUnlocking === 0 &&
    graphInPool === 0
  ) {
    graphStaked = -1;
    graphUnlocking = -1;
    graphFreeToStake = -1;
    graphInPool = -1;
    zeroBalance = true;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    spacing: zeroBalance ? 0 : 5,
    plugins: {
      legend: {
        display: true,
        padding: {
          right: 10,
        },
        position: 'left' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          color: defaultThemes.text.primary[mode],
          font: {
            size: getLabelFontsizeChart(),
            weight: '500',
          },
        },
      },
      tooltip: {
        displayColors: false,
        backgroundColor: defaultThemes.graphs.tooltip[mode],
        bodyColor: defaultThemes.text.invert[mode],
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${
              context.parsed === -1 ? 0 : humanNumber(context.parsed)
            } ${network.unit}`;
          },
        },
      },
    },
    cutout: '75%',
  };

  // determine stats from network features
  let _labels = ['Available', 'Unlocking', 'Staking', 'In Pool'];
  let _data = [graphFreeToStake, graphUnlocking, graphStaked, graphInPool];
  let _colors = zeroBalance
    ? [
        defaultThemes.graphs.colors[1][mode],
        defaultThemes.graphs.inactive2[mode],
        defaultThemes.graphs.inactive2[mode],
        defaultThemes.graphs.inactive[mode],
      ]
    : [
        defaultThemes.graphs.colors[1][mode],
        defaultThemes.graphs.colors[0][mode],
        networkColors[`${network.name}-${mode}`],
        networkColorsSecondary[`${network.name}-${mode}`],
      ];

  _data = features.pools ? _data : _data.slice(0, 3);
  _colors = features.pools ? _colors : _colors.slice(0, 3);
  _labels = features.pools ? _labels : _labels.slice(0, 3);

  // default to a greyscale 50/50 donut on zero balance
  let dataSet;
  if (zeroBalance) {
    dataSet = {
      label: network.unit,
      data: _data,
      backgroundColor: _colors,
      borderWidth: 0,
    };
  } else {
    dataSet = {
      label: network.unit,
      data: _data,
      backgroundColor: _colors,
      borderWidth: 0,
    };
  }

  const data = {
    labels: _labels,
    datasets: [dataSet],
  };

  const ref = React.useRef<HTMLDivElement>(null);
  const size = useSize(ref.current);
  const { width, height, minHeight } = formatSize(size, 220);

  return (
    <>
      <div className="head" style={{ paddingTop: '0' }}>
        <h4>
          Balance
          <OpenAssistantIcon page="overview" title="Your Balance" />
        </h4>
        <h2>
          <span className="amount">{humanNumber(freeBase)}</span>&nbsp;
          {network.unit}
          <span className="fiat">
            {services.includes('binance_spot') && (
              <>&nbsp;{usdFormatter.format(Number(freeBalance))}</>
            )}
          </span>
        </h2>
      </div>
      <div style={{ paddingTop: '20px' }} />
      <div className="inner" ref={ref} style={{ minHeight }}>
        <div
          className="graph"
          style={{
            height: `${height}px`,
            width: `${width}px`,
            position: 'absolute',
          }}
        >
          <Doughnut options={options} data={data} />
        </div>
      </div>
      <div style={{ paddingTop: '25px' }} />
    </>
  );
};

export default BalanceGraph;
