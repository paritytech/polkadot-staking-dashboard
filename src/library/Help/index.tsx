// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { useHelp } from 'contexts/Help';
import { HELP_CONFIG } from 'config/help';
import {
  HelpItemRaw,
  HelpDefinition,
  HelpDefinitions,
  HelpExternal,
  HelpExternals,
} from 'contexts/Help/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReplyAll, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Wrapper, ContentWrapper, HeightWrapper } from './Wrappers';
import Definition from './Items/Definition';
import External from './Items/External';

export const Help = () => {
  const {
    setStatus,
    status,
    fillDefinitionVariables,
    definition,
    closeHelp,
    setDefinition,
  } = useHelp();
  const controls = useAnimation();
  const { t } = useTranslation('common');
  const { t: tHelp, i18n } = useTranslation('help');

  const onFadeIn = async () => {
    await controls.start('visible');
  };

  const onFadeOut = async () => {
    await controls.start('hidden');
    setStatus(0);
  };

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
  }, [status]);

  // render early if help not open
  if (status === 0) {
    return <></>;
  }

  Object.values(HELP_CONFIG).forEach((c: any) => {
    c.forEach((ds: any) => {
      const locale_key = ds.localeKey;
      const help_hey = ds.helpKey;

      // access title and description property of key
      const title = tHelp(`${locale_key}.title`);
      const description = i18n.getResource(
        'en',
        'help',
        `${locale_key}.description`
      );

      // inject variables into definition
      const descInjected = fillDefinitionVariables({
        title,
        description,
      });

      // example of mapping descriptions array and constructing JSX
      const descJsx = descInjected.description.map((d: string, i: number) => (
        <p key={`index_${i}`}>{d}</p>
      ));
    });
  });

  let meta: any | undefined;

  if (definition) {
    // get items for active category
    meta = Object.values(HELP_CONFIG).find((item: any) =>
      item?.definitions?.find((d: HelpDefinition) => d.title === definition)
    );
  } else {
    // get all items
    let _definitions: HelpDefinitions = [];
    let _external: HelpExternals = [];

    Object.values(HELP_CONFIG).forEach((c: any) => {
      _definitions = _definitions.concat([...(c.definitions || [])]);
      _external = _external.concat([...(c.external || [])]);
    });
    meta = { definitions: _definitions, external: _external };
  }

  // resources to display
  let definitions = meta?.definitions ?? [];

  // get active definiton
  let activeDefinition = definition
    ? definitions.find((d: HelpDefinition) => d.title === definition)
    : null;

  // fill placeholder variables
  activeDefinition = activeDefinition
    ? fillDefinitionVariables(activeDefinition)
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
                  {t('library.all_resources')}
                </button>
              )}
              <button type="button" onClick={() => closeHelp()}>
                <FontAwesomeIcon icon={faTimes} />
                {t('library.close')}
              </button>
            </div>
            <h1>
              {activeDefinition
                ? `${activeDefinition.title}`
                : `${t('library.help_resources')}`}
            </h1>

            {activeDefinition !== null && (
              <>
                <Definition
                  open
                  onClick={() => {}}
                  title={activeDefinition.title}
                  description={activeDefinition.description}
                />
              </>
            )}

            {/* Display definitions */}
            {definitions.length > 0 && (
              <>
                <h3>
                  {activeDefinition ? `Related ` : ''}
                  {t('library.definitions')}
                </h3>
                {definitions.map((item: HelpDefinition, index: number) => {
                  item = fillDefinitionVariables(item);
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
                <h3>{t('library.articles')}</h3>
                {external.map((item: HelpExternal, index: number) => {
                  const thisRteturn = (
                    <External
                      key={`ext_${index}`}
                      width="100%"
                      title={t(item.title)}
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
