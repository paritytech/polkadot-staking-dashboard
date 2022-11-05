// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faReplyAll, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HELP_CONFIG } from 'config/help';
import { useHelp } from 'contexts/Help';
import {
  HelpDefinition,
  HelpDefinitions,
  HelpExternal,
  HelpExternals,
  HelpItemRaw,
} from 'contexts/Help/types';
import { useAnimation } from 'framer-motion';
import useFillVariables from 'library/Hooks/useFillVariables';
import { useCallback, useEffect } from 'react';
import { AnyJson } from 'types';
import Definition from './Items/Definition';
import External from './Items/External';
import { ContentWrapper, HeightWrapper, Wrapper } from './Wrappers';

export const Help = () => {
  const { setStatus, status, definition, closeHelp, setDefinition } = useHelp();
  const controls = useAnimation();
  const { fillVariables } = useFillVariables();

  const onFadeIn = useCallback(async () => {
    await controls.start('visible');
  }, [controls]);

  const onFadeOut = useCallback(async () => {
    await controls.start('hidden');
    setStatus(0);
  }, [controls, setStatus]);

  const variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

  useEffect(() => {
    // help has been opened - fade in
    if (status === 1) {
      onFadeIn();
    }
    // an external component triggered closure - fade out
    if (status === 2) {
      onFadeOut();
    }
  }, [onFadeIn, onFadeOut, status]);

  // render early if help not open
  if (status === 0) return <></>;

  let meta: HelpItemRaw | undefined;

  if (definition) {
    // get items for active category
    meta = Object.values(HELP_CONFIG).find((item: HelpItemRaw) =>
      item?.definitions?.find((d: HelpDefinition) => d.title === definition)
    );
  } else {
    // get all items
    let _definitions: HelpDefinitions = [];
    let _external: HelpExternals = [];

    Object.values(HELP_CONFIG).forEach((c: HelpItemRaw) => {
      _definitions = _definitions.concat([...(c.definitions || [])]);
      _external = _external.concat([...(c.external || [])]);
    });
    meta = { definitions: _definitions, external: _external };
  }

  // resources to display
  let definitions = meta?.definitions ?? [];

  // get active definiton
  let activeDefinition: AnyJson = definition
    ? definitions.find((d: HelpDefinition) => d.title === definition)
    : null;

  // fill placeholder variables
  activeDefinition = activeDefinition
    ? fillVariables(activeDefinition, ['title', 'description'])
    : null;

  // filter active definition
  definitions = definitions.filter(
    (d: HelpDefinition) => d.title !== definition
  );

  // get external resources
  const external = meta?.external ?? [];

  return (
    <Wrapper
      initial={{
        opacity: 0,
      }}
      animate={controls}
      transition={{
        duration: 0.25,
      }}
      variants={variants}
    >
      <div>
        <HeightWrapper>
          <ContentWrapper>
            <div className="buttons">
              {definition && (
                <button type="button" onClick={() => setDefinition(null)}>
                  <FontAwesomeIcon icon={faReplyAll} />
                  All Resources
                </button>
              )}
              <button type="button" onClick={() => closeHelp()}>
                <FontAwesomeIcon icon={faTimes} />
                Close
              </button>
            </div>
            <h1>
              {activeDefinition
                ? `${activeDefinition.title}`
                : `Help Resources`}
            </h1>

            {activeDefinition !== null && (
              <>
                <Definition
                  open
                  onClick={() => {}}
                  title={activeDefinition?.title}
                  description={activeDefinition?.description}
                />
              </>
            )}

            {/* Display definitions */}
            {definitions.length > 0 && (
              <>
                <h3>
                  {activeDefinition ? `Related ` : ''}
                  Definitions
                </h3>
                {definitions.map((item: AnyJson, index: number) => {
                  item = fillVariables(item, ['title', 'description']);
                  return (
                    <Definition
                      key={`def_${index}`}
                      onClick={() => {}}
                      title={item.title}
                      description={item.description}
                    />
                  );
                })}
              </>
            )}

            {/* Display external */}
            {external.length > 0 && (
              <>
                <h3>Articles</h3>
                {external.map((item: HelpExternal, index: number) => {
                  const thisRteturn = (
                    <External
                      key={`ext_${index}`}
                      width="100%"
                      title={item.title}
                      url={item.url}
                      website={item.website}
                    />
                  );

                  return thisRteturn;
                })}
              </>
            )}
          </ContentWrapper>
        </HeightWrapper>
        <button
          type="button"
          className="close"
          onClick={() => {
            closeHelp();
          }}
        >
          &nbsp;
        </button>
      </div>
    </Wrapper>
  );
};
