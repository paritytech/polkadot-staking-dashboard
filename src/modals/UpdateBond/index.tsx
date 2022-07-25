// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useModal } from 'contexts/Modal';
import { HeadingWrapper } from '../Wrappers';
import { Wrapper, CardsWrapper, FixedContentWrapper } from './Wrappers';
import { Tasks } from './Tasks';
import { Forms } from './Forms';

export const UpdateBond = () => {
  const { config, setModalHeight } = useModal();
  const { fn, bondType } = config;
  // modal task
  const [task, setTask] = useState(null);

  // active modal section
  const [section, setSection] = useState(0);

  // refs for wrappers
  const headerRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const formsRef = useRef<HTMLDivElement>(null);

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
      <CardsWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.5,
          type: 'spring',
          bounce: 0.1,
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
        <Forms
          setSection={setSection}
          task={task}
          ref={formsRef}
          bondType={bondType}
        />
      </CardsWrapper>
    </Wrapper>
  );
};

export default UpdateBond;
