// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import {
  addDays,
  differenceInDays,
  fromUnixTime,
  getUnixTime,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';
import { AnyApi, AnySubscan } from 'types';
import { greaterThanZero, planckToUnit } from 'Utils';
import { PayoutDayCursor } from './types';

// Given payouts, calculate daily income and fill missing days with zero amounts.
export const calculatePayoutsByDay = (
  payouts: any,
  maxDays: number,
  units: number,
  // eslint-disable-next-line
  subject: string
) => {
  let payoutsByDay: any = [];

  // remove days that are beyond end day limit
  payouts = payouts.filter((p: AnySubscan) => {
    return daysPassed(fromUnixTime(p.block_timestamp), new Date()) <= maxDays;
  });

  // return now if no payouts.
  if (!payouts.length) return payouts;

  // post-fill any missing days. [current day -> last payout]
  payoutsByDay = postFillMissingDays(payouts, maxDays);

  // start iterating payouts, most recent first.
  //
  // payouts passed.
  let p = 0;
  // current day cursor.
  let curDay: Date = new Date();
  // current payout cursor.
  let curPayout: PayoutDayCursor = {
    amount: new BigNumber(0),
    event_id: '',
  };
  for (const payout of payouts) {
    p++;

    // extract day from current payout.
    const thisDay = startOfDay(fromUnixTime(payout.block_timestamp));

    // initialise current day if first payout.
    if (p === 1) {
      curDay = thisDay;
    }

    // handle surpassed maximum days.
    if (daysPassed(thisDay, new Date()) >= maxDays) {
      payoutsByDay.push({
        amount: planckToUnit(curPayout.amount, units),
        event_id: getEventId(curPayout),
        block_timestamp: getUnixTime(curDay),
      });
      break;
    }

    // get day difference between cursor and currentpayout.
    const daysDiff = daysPassed(thisDay, curDay);

    // handle new day.
    if (daysDiff > 0) {
      // add current payout cursor to payoutsByDay.
      payoutsByDay.push({
        amount: planckToUnit(curPayout.amount, units),
        event_id: getEventId(curPayout),
        block_timestamp: getUnixTime(curDay),
      });

      // update day cursor to the new day.
      curDay = thisDay;
      // reset current payout cursor for the new day.
      curPayout = {
        amount: new BigNumber(payout.amount),
        event_id: new BigNumber(payout.amount).isLessThan(new BigNumber(0))
          ? 'Slash'
          : 'Reward',
      };
    } else {
      // in same day. Aadd payout amount to current payout cursor.
      curPayout.amount = curPayout.amount.plus(new BigNumber(payout.amount));
    }

    // if only 1 payout exists, exit early here.
    if (payouts.length === 1) {
      payoutsByDay.push({
        amount: planckToUnit(curPayout.amount, units),
        event_id: getEventId(curPayout),
        block_timestamp: getUnixTime(curDay),
      });
      break;
    }
  }

  // return payout amounts as plain numbers.
  return payoutsByDay.map((q: AnyApi) => ({
    ...q,
    amount: Number(q.amount.toString()),
  }));
};

// Calculate average payouts per day.
export const calculatePayoutAverages = (
  payoutsByDay: AnySubscan,
  average: number,
  days: number
) => {
  // if we don't need to take an average, just return `payoutsByDay`.
  if (average <= 1) return payoutsByDay;

  // create moving average value over `average` past days, if any.
  const payoutsAverages = [];
  for (let i = 0; i < payoutsByDay.length; i++) {
    // average period end.
    const end = Math.max(0, i - average);

    // the total amount earned in period.
    let total = 0;
    // period length to be determined.
    let num = 0;

    for (let j = i; j >= end; j--) {
      if (payoutsByDay[j]) {
        total += payoutsByDay[j].amount;
      }
      // increase by one to treat non-existent as zero value
      num += 1;
    }

    if (total === 0) {
      total = payoutsByDay[i].amount;
    }

    payoutsAverages.push({
      amount: total / num,
      event_id: payoutsByDay[i].event_id,
      block_timestamp: payoutsByDay[i].block_timestamp,
    });
  }

  // return an array with the expected number of items
  return payoutsAverages.slice(0, days);
};

// Fetch rewards and graph meta data.
//
// Format provided payouts and returns the last payment.
export const formatRewardsForGraphs = (
  days: number,
  units: number,
  payouts: AnySubscan,
  poolClaims: AnySubscan
) => {
  // process staking payouts.
  const payoutsByDay = processPayouts(payouts, days, units, 'staking');
  const poolClaimsByDay = processPayouts(poolClaims, days, units, 'pools');

  return {
    // reverse rewards: most recent last
    payoutsByDay,
    poolClaimsByDay,
    lastReward: getLatestReward(payouts, poolClaims),
  };
};

// Process payouts.
//
// calls the relevant functions on raw payouts to format them correctly.
const processPayouts = (
  payouts: AnySubscan,
  days: number,
  units: number,
  subject: string
) => {
  // normalise payout timestamps.
  const normalised = normalisePayouts(payouts);
  // calculate payouts per day from the current day.
  let p = calculatePayoutsByDay(normalised, days, units, subject);
  // pre-fill payouts if max days have not been reached.
  p = p.concat(prefillMissingDays(p, days));
  // fill in gap days between payouts with zero values.
  p = fillGapDays(p);
  // reverse payouts: most recent last.
  p = p.reverse();
  return p;
};

// Combine reward payouts.
//
// combines payouts and pool claims into daily records. Removes the `event_id` field from records.
export const combineRewardsByDay = (
  payoutsByDay: AnySubscan,
  poolClaimsByDay: AnySubscan
) => {
  // we first check if actual payouts exist, e.g. there are non-zero payout
  // amounts present in either payouts or pool claims.
  const poolClaimExists =
    poolClaimsByDay.find((p: AnySubscan) => p.amount > 0) || null;
  const payoutExists =
    payoutsByDay.find((p: AnySubscan) => p.amount > 0) || null;

  // if no pool claims exist but payouts do, return payouts w.o. event_id
  // also do this if there are no payouts period.
  if (
    (!poolClaimExists && payoutExists) ||
    (!payoutExists && !poolClaimExists)
  ) {
    return payoutsByDay.map((p: AnySubscan) => ({
      amount: p.amount,
      block_timestamp: p.block_timestamp,
    }));
  }

  // if no payouts exist but pool claims do, return pool claims w.o. event_id
  if (!payoutExists && poolClaimExists) {
    return poolClaimsByDay.map((p: AnySubscan) => ({
      amount: p.amount,
      block_timestamp: p.block_timestamp,
    }));
  }

  // We now know pool claims *and* payouts exist.
  //
  // Now determine which dates to display.
  let payoutDays: Array<any> = [];
  // prefill `dates` with all pool claim and payout days
  poolClaimsByDay.forEach((p: AnySubscan) => {
    const dayStart = getUnixTime(startOfDay(fromUnixTime(p.block_timestamp)));
    if (!payoutDays.includes(dayStart)) {
      payoutDays.push(dayStart);
    }
  });
  payoutsByDay.forEach((p: AnySubscan) => {
    const dayStart = getUnixTime(startOfDay(fromUnixTime(p.block_timestamp)));
    if (!payoutDays.includes(dayStart)) {
      payoutDays.push(dayStart);
    }
  });

  // sort payoutDays by `block_timestamp`;
  payoutDays = payoutDays.sort((a: AnySubscan, b: AnySubscan) => a - b);

  // Iterate payout days.
  //
  // Combine payouts into one unified `rewards` array.
  const rewards: AnySubscan = [];

  // loop pool claims and consume / combine payouts
  payoutDays.forEach((d: AnySubscan) => {
    let amount = 0;

    // check payouts exist on this day
    const payoutsThisDay = payoutsByDay.filter((p: AnySubscan) =>
      isSameDay(fromUnixTime(p.block_timestamp), fromUnixTime(d))
    );
    // check pool claims exist on this day
    const poolClaimsThisDay = poolClaimsByDay.filter((p: AnySubscan) =>
      isSameDay(fromUnixTime(p.block_timestamp), fromUnixTime(d))
    );
    // add amounts
    if (payoutsThisDay.concat(poolClaimsThisDay).length) {
      for (const payout of payoutsThisDay) {
        amount += payout.amount;
      }
    }
    rewards.push({
      amount,
      block_timestamp: d,
    });
  });
  return rewards;
};

// Get latest reward.
//
// Gets the latest reward from pool claims and nominator payouts.
export const getLatestReward = (
  payouts: AnySubscan,
  poolClaims: AnySubscan
) => {
  // get most recent payout
  const payoutExists =
    payouts.find((p: AnySubscan) => greaterThanZero(new BigNumber(p.amount))) ??
    null;
  const poolClaimExists =
    poolClaims.find((p: AnySubscan) =>
      greaterThanZero(new BigNumber(p.amount))
    ) ?? null;

  // calculate which payout was most recent
  let lastReward = null;
  if (!payoutExists || !poolClaimExists) {
    if (payoutExists) {
      lastReward = payoutExists;
    }
    if (poolClaimExists) {
      lastReward = poolClaimExists;
    }
  } else {
    // both `payoutExists` and `poolClaimExists` are present
    lastReward =
      payoutExists.block_timestamp > poolClaimExists.block_timestamp
        ? payoutExists
        : poolClaimExists;
  }
  return lastReward;
};

// Fill in the days from the earliest payout day to `maxDays`.
//
// Takes the last (earliest) payout and fills the missing days from that payout day to `maxDays`.
export const prefillMissingDays = (payoutsByDay: any, maxDays: number) => {
  const newPayouts = [];
  const payoutStartDay = subDays(startOfDay(new Date()), maxDays);
  const payoutEndDay = !payoutsByDay.length
    ? startOfDay(new Date())
    : startOfDay(
        fromUnixTime(payoutsByDay[payoutsByDay.length - 1].block_timestamp)
      );

  const daysToPreFill = daysPassed(payoutStartDay, payoutEndDay);

  if (daysToPreFill > 0) {
    for (let i = 1; i < daysToPreFill; i++) {
      newPayouts.push({
        amount: 0,
        event_id: 'Reward',
        block_timestamp: getUnixTime(subDays(payoutEndDay, i)),
      });
    }
  }
  return newPayouts;
};

// Fill in the days from the current day to the last payout.
//
// Takes the first payout (most recent) and fills the missing days from current day.
export const postFillMissingDays = (payouts: AnySubscan, maxDays: number) => {
  const newPayouts = [];
  const payoutsEndDay = startOfDay(fromUnixTime(payouts[0].block_timestamp));
  const daysSinceLast = Math.min(
    daysPassed(payoutsEndDay, startOfDay(new Date())),
    maxDays
  );

  for (let i = daysSinceLast; i > 0; i--) {
    newPayouts.push({
      amount: 0,
      event_id: 'Reward',
      block_timestamp: getUnixTime(addDays(payoutsEndDay, i)),
    });
  }
  return newPayouts;
};

// Fill gap days within payouts with zero amounts.
export const fillGapDays = (payouts: AnySubscan) => {
  const finalPayouts: AnySubscan = [];

  // current day cursor.
  let curDay = new Date();

  for (const p of payouts) {
    const thisDay = fromUnixTime(p.block_timestamp);
    const gapDays = Math.max(0, daysPassed(thisDay, curDay) - 1);

    if (gapDays > 0) {
      // add any gap days.
      if (gapDays > 0) {
        for (let j = 1; j <= gapDays; j++) {
          finalPayouts.push({
            amount: 0,
            event_id: 'Reward',
            block_timestamp: getUnixTime(subDays(curDay, j)),
          });
        }
      }
    }

    // add the current day.
    finalPayouts.push(p);

    // day cursor is now the new day.
    curDay = thisDay;
  }
  return finalPayouts;
};

// Utiltiy: normalise payout timestamps to start of day.
export const normalisePayouts = (payouts: AnySubscan) =>
  payouts.map((p: AnySubscan) => ({
    ...p,
    block_timestamp: getUnixTime(startOfDay(fromUnixTime(p.block_timestamp))),
  }));

// Utility: days passed since 2 dates.
export const daysPassed = (from: Date, to: Date) =>
  differenceInDays(startOfDay(to), startOfDay(from));

// Utility: extract whether an event id should be a slash or reward, based on the net day amount.
const getEventId = (c: PayoutDayCursor) =>
  c.amount.isLessThan(new BigNumber(0)) ? 'Slash' : 'Reward';

// Utility: Formats a width and height pair.
export const formatSize = (
  {
    width,
    height,
  }: {
    width: string | number;
    height: number;
  },
  minHeight: number
) => ({
  width: width || '100%',
  height: height || minHeight,
  minHeight,
});
