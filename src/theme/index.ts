// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import theme from 'styled-theming';
import {
  defaultThemes,
  cardThemes,
  networkColors,
  networkColorsSecondary,
  networkColorsTransparent,
} from './default';

/* Aggregates all theme configurations and serves the currently
 * active mode via the theming context.
 */
const v = 'mode';

// text colors

export const textPrimary: theme.ThemeSet = theme(v, defaultThemes.text.primary);

export const textSecondary: theme.ThemeSet = theme(
  v,
  defaultThemes.text.secondary
);

export const textInvert: theme.ThemeSet = theme(v, defaultThemes.text.invert);

export const textDanger: theme.ThemeSet = theme(v, defaultThemes.text.danger);

export const textSuccess: theme.ThemeSet = theme(v, defaultThemes.text.success);

// background colors

export const backgroundPrimary: theme.ThemeSet = theme(
  v,
  defaultThemes.background.primary
);

export const backgroundSecondary: theme.ThemeSet = theme(
  v,
  defaultThemes.background.secondary
);

export const backgroundGradient: theme.ThemeSet = theme(
  v,
  defaultThemes.background.gradient
);

export const backgroundNetworkBar: theme.ThemeSet = theme(
  v,
  defaultThemes.background.network
);

export const backgroundDropdown: theme.ThemeSet = theme(
  v,
  defaultThemes.background.dropdown
);

export const backgroundValidator: theme.ThemeSet = theme(
  v,
  defaultThemes.background.validator
);

export const backgroundLabel: theme.ThemeSet = theme(
  v,
  defaultThemes.background.label
);

export const backgroundIdenticon: theme.ThemeSet = theme(
  v,
  defaultThemes.background.identicon
);

export const backgroundOverlay: theme.ThemeSet = theme(
  v,
  defaultThemes.background.overlay
);

// highlights

export const highlightPrimary: theme.ThemeSet = theme(
  v,
  defaultThemes.highlight.primary
);

export const highlightSecondary: theme.ThemeSet = theme(
  v,
  defaultThemes.highlight.secondary
);

// buttons

export const buttonPrimaryBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.primary.background
);

export const buttonSecondaryBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.secondary.background
);

export const backgroundToggle: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.toggle.background
);

export const buttonAssistantBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.assistant.background
);

export const buttonHoverBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.hover.background
);

export const buttonDisabledBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.disabled.background
);

export const buttonDisabledText: theme.ThemeSet = theme(
  v,
  defaultThemes.buttons.disabled.text
);

// labels

export const tagBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.background.tag
);

// graphs

export const tooltipBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.graphs.tooltip
);

export const gridColor: theme.ThemeSet = theme(v, defaultThemes.graphs.grid);

// borders

export const borderPrimary: theme.ThemeSet = theme(
  v,
  defaultThemes.border.primary
);

export const borderSecondary: theme.ThemeSet = theme(
  v,
  defaultThemes.border.secondary
);

// modal

export const modalOverlayBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.modal.overlay
);

export const modalBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.modal.background
);

// assistant

export const assistantBackground: theme.ThemeSet = theme(
  v,
  defaultThemes.assistant.background
);

export const assistantButton: theme.ThemeSet = theme(
  v,
  defaultThemes.assistant.button.background
);

export const assistantLink: theme.ThemeSet = theme(
  v,
  defaultThemes.assistant.link
);

// shadow

export const shadowColor: theme.ThemeSet = theme(v, defaultThemes.shadow);

/* Aggregates all card configurations and serves the currently
 * active card style via the theming context.
 */
const c = 'card';

export const cardBorder: theme.ThemeSet = theme(c, cardThemes.card.border);

export const cardShadow: theme.ThemeSet = theme(c, cardThemes.card.shadow);

/* Serves the currently active network color via the theming context.
 */

const n = 'network';

export const networkColor: theme.ThemeSet = theme(n, networkColors);

export const networkColorSecondary: theme.ThemeSet = theme(
  n,
  networkColorsSecondary
);

export const networkColorTransparent: theme.ThemeSet = theme(
  n,
  networkColorsTransparent
);
