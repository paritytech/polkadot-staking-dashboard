// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { PageRowWrapper } from 'Wrappers';
import { useApi } from 'contexts/Api';
import { useValidators } from 'contexts/Validators';
import { ItemsWrapper } from './Wrappers';
import { Item } from './Item';
import { useCommunitySections } from './context';

export const List = () => {
  const { network } = useApi();
  const { validatorCommunity } = useValidators();
  const { scrollPos } = useCommunitySections();

  const [entityItems, setEntityItems] = useState(
    validatorCommunity.filter(
      (v) => v.validators[network.name.toLowerCase()] !== undefined
    )
  );

  useEffect(() => {
    setEntityItems(
      validatorCommunity.filter(
        (v) => v.validators[network.name.toLowerCase()] !== undefined
      )
    );
  }, [network]);

  useEffect(() => {
    window.scrollTo(0, scrollPos);
  }, [scrollPos]);

  // TODO: add ordering (random, alphabetically ascending or descending) (larger ValidatorList style buttons).
  // TODO: ability to pin validator identities to the top of the list (persist to localStorage).
  // TODO: refer to saved scroll pos (context) and go to it immediately when activeItem goes back to null.
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: scrollPos ? 0 : 0.5,
        staggerChildren: scrollPos ? 0 : 0.025,
      },
    },
  };

  return (
    <PageRowWrapper className="page-padding">
      <ItemsWrapper variants={container} initial="hidden" animate="show">
        {entityItems.map((item: any, index: number) => {
          return (
            <Item key={`community_item_${index}`} item={item} actionable />
          );
        })}
      </ItemsWrapper>
    </PageRowWrapper>
  );
};

export default List;
