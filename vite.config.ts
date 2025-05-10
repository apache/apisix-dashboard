/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import observerPlugin from 'mobx-react-observer/swc-plugin';
import postcssPresetMantine from 'postcss-preset-mantine';
import postcssSimpleVars from 'postcss-simple-vars';
import UnpluginIcons from 'unplugin-icons/vite';
import UnpluginInfo from 'unplugin-info/vite';
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
    UnpluginInfo(),
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      semicolons: false,
    }),
    react({
      plugins: [observerPlugin() as never],
    }),
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
