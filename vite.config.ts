import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
// TODO: Remove this once Ledger confirmed to be working without it.
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
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
    outDir: 'build'
  }, 
  // optimizeDeps: {
  //   esbuildOptions: {
  //     define: {
  //       global: 'globalThis'
  //     },
  //     plugins: [
  //       NodeGlobalsPolyfillPlugin({
  //         buffer: true
  //       })
  //     ]
  //   }
  // }
})
