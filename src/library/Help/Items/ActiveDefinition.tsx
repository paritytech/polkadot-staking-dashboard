// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DefinitionWrapper } from '../Wrappers';

export const ActiveDefinition = ({
  description,
}: {
  description: string[];
}) => {
  return (
    <DefinitionWrapper>
      <div>
        {description.map((item: any, index: number) => (
          <h4 key={`inner_def_${index}`} className="definition">
            {item}
          </h4>
        ))}
      </div>
    </DefinitionWrapper>
  );
};
