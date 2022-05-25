// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { HeadingWrapper } from '../Wrappers';
import { useModal } from '../../contexts/Modal';
import { Wrapper, SectionsWrapper, FixedContentWrapper } from './Wrappers';
import { Tasks } from './Tasks';
import { StakeForms } from './StakeForms';
import { PoolForms } from './PoolForms';

export const UpdateBond = () => {
  const { config, setModalHeight }: any = useModal();
  const { fn, target } = config;
  // modal task
  const [task, setTask]: any = useState(null);

  // active modal section
  const [section, setSection] = useState(0);

  // refs for wrappers
  const headerRef: any = useRef(null);
  const tasksRef: any = useRef(null);
  const formsRef: any = useRef(null);

  // resize modal on state change
  useEffect(() => {
    let _height = headerRef.current?.clientHeight ?? 0;
    if (section === 0) {
      _height += tasksRef.current?.clientHeight ?? 0;
    } else {
      _height += formsRef.current?.clientHeight ?? 0;
    }
    setModalHeight(_height);
  }, [section, task]);

  return (
    <Wrapper>
      <FixedContentWrapper ref={headerRef}>
        <HeadingWrapper>
          <FontAwesomeIcon
            transform="grow-2"
            icon={fn === 'add' ? faPlus : faMinus}
          />
          {fn === 'add' ? 'Add To' : 'Remove'} Bond
        </HeadingWrapper>
      </FixedContentWrapper>
      <SectionsWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.5,
          type: 'spring',
          bounce: 0.22,
        }}
        variants={{
          home: {
            left: 0,
          },
          next: {
            left: '-100%',
          },
        }}
      >
        <Tasks setSection={setSection} setTask={setTask} ref={tasksRef} />
        {target === 'pool' ? (
          <PoolForms setSection={setSection} task={task} ref={formsRef} />
        ) : (
          <StakeForms setSection={setSection} task={task} ref={formsRef} />
        )}
      </SectionsWrapper>
    </Wrapper>
  );
};

export default UpdateBond;
