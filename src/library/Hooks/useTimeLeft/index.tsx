// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getUnixTime, intervalToDuration } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setStateWithRef } from 'Utils';
import { defaultDuration } from './defaults';
import {
  TimeLeftAll,
  TimeleftDuration,
  TimeLeftFormatted,
  TimeLeftRaw,
} from './types';

export const useTimeLeft = () => {
  const { t, i18n } = useTranslation();

  // adds `seconds` to the current time and returns the resulting date.
  const fromNow = (seconds: number): Date => {
    const end = new Date();
    end.setSeconds(end.getSeconds() + seconds);
    return end;
  };

  // calculates the current timeleft duration.
  const getDuration = (toDate: Date | null): TimeleftDuration => {
    if (!toDate) {
      return defaultDuration;
    }
    if (getUnixTime(toDate) <= getUnixTime(new Date())) {
      return defaultDuration;
    }
    toDate.setSeconds(toDate.getSeconds());
    const d = intervalToDuration({
      start: Date.now(),
      end: toDate,
    });

    const days = d?.days || 0;
    const hours = d?.hours || 0;
    const minutes = d?.minutes || 0;
    const seconds = d?.seconds || 0;
    const lastHour = days === 0 && hours === 0;
    const lastMinute = lastHour && minutes === 0;

    return {
      days,
      hours,
      minutes,
      seconds,
      lastMinute,
    };
  };

  // check whether timeleft is within a minute of finishing.
  const inLastHour = () => {
    const { days, hours } = getDuration(toRef.current);
    return !days && !hours;
  };

  // get the amount of seconds left if timeleft is in the last minute.
  const lastMinuteCountdown = () => {
    const { seconds } = getDuration(toRef.current);
    if (!inLastHour()) {
      return 60;
    }
    return seconds;
  };

  // calculate resulting timeleft object from latest duration.
  const getTimeleft = (c?: TimeleftDuration): TimeLeftAll => {
    const { days, hours, minutes, seconds } = c || getDuration(toRef.current);

    const raw: TimeLeftRaw = {
      days,
      hours,
      minutes,
    };
    const formatted: TimeLeftFormatted = {
      days: [days, t('time.day', { count: days, ns: 'base' })],
      hours: [hours, t('time.hr', { count: hours, ns: 'base' })],
      minutes: [minutes, t('time.min', { count: minutes, ns: 'base' })],
    };
    if (!days && !hours) {
      formatted.seconds = [
        seconds,
        t('time.second', { count: seconds, ns: 'base' }),
      ];
      raw.seconds = seconds;
    }

    return {
      raw,
      formatted,
    };
  };

  // the end time as a date.
  const [to, setTo] = useState<Date | null>(null);
  const toRef = useRef(to);

  // resulting timeleft object to be returned.
  const [timeleft, setTimeleft] = useState<TimeLeftAll>(getTimeleft());

  // timeleft refresh intervals.
  const [minInterval, setMinInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [secInterval, setSecInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  // refresh every minute, or every second if in last minute.
  useEffect(() => {
    if (inLastHour()) {
      // refresh timeleft every second
      if (!secInterval) {
        setSecInterval(
          setInterval(() => {
            if (!inLastHour()) {
              if (secInterval) clearInterval(secInterval);
              setSecInterval(null);
            }
            setTimeleft(getTimeleft());
          }, 1000)
        );
      }
    } else {
      setTimeleft(getTimeleft());

      // refresh timeleft every minute.
      if (!minInterval) {
        setMinInterval(
          setInterval(() => {
            if (inLastHour()) {
              if (minInterval) clearInterval(minInterval);
              setMinInterval(null);
            }
            setTimeleft(getTimeleft());
          }, 60000)
        );
      }
    }
  }, [to, inLastHour(), lastMinuteCountdown()]);

  // re-render the timeleft upon langauge switch.
  useEffect(() => {
    setTimeleft(getTimeleft());
  }, [i18n.resolvedLanguage]);

  // clear intervals on unmount
  useEffect(() => {
    return () => {
      if (minInterval) {
        clearInterval(minInterval);
        setMinInterval(null);
      }
      if (secInterval) {
        clearInterval(secInterval);
        setSecInterval(null);
      }
    };
  }, []);

  // format the duration as a string.
  const timeleftAsString = (() => {
    const { days, hours, minutes, seconds } = getDuration(toRef.current);

    let str = '';
    if (days > 0) {
      str += `${days} ${t('time.day', { count: days, ns: 'base' })} `;
    }
    str += `${hours} ${t('time.hr', { count: hours, ns: 'base' })} `;
    str += `${minutes} ${t('time.min', { count: minutes, ns: 'base' })}`;

    if (!days && !hours) {
      str += ` ${seconds}`;
    }
    return str;
  })();

  const setFromNow = (dateTo: Date) => {
    setTimeleft(getTimeleft(getDuration(new Date())));
    setStateWithRef(dateTo, setTo, toRef);
  };

  return {
    setFromNow,
    fromNow,
    timeleft,
    timeleftAsString,
  };
};
