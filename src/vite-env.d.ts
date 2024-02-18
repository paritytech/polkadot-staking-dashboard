// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'dotlottie-player': any;
  }
}
