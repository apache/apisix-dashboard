import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import postcssPresetMantine from 'postcss-preset-mantine';
import postcssSimpleVars from 'postcss-simple-vars';
import UnpluginIcons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { API_PREFIX, BASE_PATH } from './src/config/constant';

const inDevContainer = process.env.REMOTE_CONTAINERS === 'true';

if (inDevContainer) {
  // eslint-disable-next-line no-console
  console.info('Running in dev container');
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  server: {
    ...(inDevContainer && {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
        port: 5174,
      },
      proxy: {
        [API_PREFIX]: {
          target: 'http://apisix:9180',
          changeOrigin: true,
        },
      },
    }),
  },
  plugins: [
    tsconfigPaths(),
    UnpluginIcons({
      autoInstall: true,
      compiler: 'jsx',
      jsx: 'react',
    }),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true, semicolons: false }),
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        postcssPresetMantine,
        postcssSimpleVars({
          variables: {
            'mantine-breakpoint-xs': '36em',
            'mantine-breakpoint-sm': '48em',
            'mantine-breakpoint-md': '62em',
            'mantine-breakpoint-lg': '75em',
            'mantine-breakpoint-xl': '88em',
          },
        }),
      ],
    },
  },
});
