// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTooltip } from 'contexts/Tooltip';
import { TooltipPosition, TooltipTrigger } from 'library/ListItem/Wrappers';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const Commission = ({ commission }: { commission: number }) => {
  const { t } = useTranslation('library');
  const { setTooltipPosition, setTooltipMeta, open } = useTooltip();

  const posRef = useRef<HTMLDivElement>(null);

  const tooltipText = t('validatorCommission');

  const toggleTooltip = () => {
    if (!open) {
      setTooltipMeta(tooltipText);
      setTooltipPosition(posRef);
    }
  };

  return (
    <div className="label">
      <TooltipTrigger
        className="tooltip-trigger-element"
        data-tooltip-text={tooltipText}
        onMouseMove={() => toggleTooltip()}
      />
      <TooltipPosition ref={posRef} />
      {commission}%
    </div>
  );
};
