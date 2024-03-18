// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
//
// NOTES:
// - `base` is configured in `package.json` with the vite --base flag. In local dev it is `/`,
//   whereas gh-pages always deploys to `/polkadot-staking-dashboard/`. Producution builds can also
//   be configureed with the `--base` flag.
// - `BASE_URL`env variable is used in the codebase to refer to the supplied base.
export default defineConfig({
  plugins: [
    eslint(),
    react(),
    svgr(),
    tsconfigPaths(),
    checker({
      typescript: true,
    }),
  ],
  build: {
    outDir: 'build',
  },
  server: {
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  worker: {
    format: 'es',
  },
});
