// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from 'contexts/Themes';
import { useUi } from 'contexts/UI';
import { defaultThemes } from 'theme/default';
import { Item } from './Wrappers';

export const SideMenuToggle = () => {
  const { mode } = useTheme();
  const { setSideMenu, sideMenuOpen } = useUi();

  return (
    <div className="menu">
      <Item
        style={{ width: '50px', flex: 0 }}
        onClick={() => {
          setSideMenu(sideMenuOpen ? 0 : 1);
        }}
      >
        <span className="toggle">
          <FontAwesomeIcon
            icon={faBars}
            style={{
              cursor: 'pointer',
              color: defaultThemes.text.secondary[mode],
            }}
          />
        </span>
      </Item>
    </div>
  );
};
