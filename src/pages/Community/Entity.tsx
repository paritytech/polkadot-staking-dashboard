// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { PageRowWrapper, GoBackWrapper } from 'Wrappers';
import Button from 'library/Button';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useValidators } from 'contexts/Validators';
import ValidatorList from 'library/ValidatorList';
import { CardWrapper } from 'library/Graphs/Wrappers';
import { useApi } from 'contexts/Api';
import { shuffle } from 'Utils';
import { ItemsWrapper } from './Wrappers';
import { Item } from './Item';
import { useCommunitySections } from './context';

export const Entity = () => {
  const { isReady, network } = useApi();
  const { validators: allValidators, removeValidatorMetaBatch } =
    useValidators();
  const { setActiveSection, activeItem } = useCommunitySections();

  const { name, validators: entityAllValidators } = activeItem;
  const validators = entityAllValidators[network.name.toLowerCase()] ?? [];

  // include validators that exist in `erasStakers`
  const [shuffledValidators, setShuffledValidators] = useState(
    shuffle(allValidators.filter((v) => validators.includes(v.address)))
  );

  useEffect(() => {
    setShuffledValidators(
      allValidators.filter((v) => validators.includes(v.address))
    );
  }, [allValidators, network]);

  useEffect(() => {
    removeValidatorMetaBatch(batchKey);
    const newShuffledValidators = shuffle([...shuffledValidators]);
    setShuffledValidators(shuffle(newShuffledValidators));
  }, [name, network]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05,
      },
    },
  };

  const batchKey = 'community_entity_validators';

  return (
    <PageRowWrapper className="page-padding">
      <GoBackWrapper>
        <Button
          inline
          title="Go Back"
          icon={faChevronLeft}
          transform="shrink-3"
          onClick={() => setActiveSection(0)}
        />
      </GoBackWrapper>
      <ItemsWrapper variants={container} initial="hidden" animate="show">
        <Item item={activeItem} actionable={false} />
      </ItemsWrapper>
      <CardWrapper>
        {!isReady ? (
          <div className="item">
            <h3>Connecting...</h3>
          </div>
        ) : (
          <>
            {shuffledValidators.length === 0 && (
              <div className="item">
                <h3>
                  {validators.length
                    ? 'Fetching validators...'
                    : 'This entity contains no validators.'}
                </h3>
              </div>
            )}
            {shuffledValidators.length > 0 && (
              <ValidatorList
                validators={shuffledValidators}
                batchKey={batchKey}
                title={`${name}'s Validators`}
                selectable={false}
                allowMoreCols
                pagination
                toggleFavourites
                allowFilters
              />
            )}
          </>
        )}
      </CardWrapper>
    </PageRowWrapper>
  );
};

export default Entity;
