/*
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
import { defineConfig } from 'cypress';
import * as globby from 'globby';
import 'dotenv/config';
import defaultSettings from './config/defaultSettings';

const DEFAULT_SETTINGS = defaultSettings.overwrite(process.env)

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: true,
  videoUploadOnPasses: false,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  env: {
    ...process.env,
    DEFAULT_SETTINGS,
    SERVE_URL: DEFAULT_SETTINGS.serveUrlMap[process.env.CYPRESS_SERVE_ENV || 'dev']
  },
  e2e: {
    baseUrl: 'http://localhost:8000',
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on('task', {
        findFile(mask: any) {
          if (!mask) {
            throw new Error('Missing a file mask to search');
          }

          return globby(mask).then((list) => {
            if (!list.length) {
              throw new Error(`Could not find files matching mask "${mask}"`);
            }

            return list[0];
          });
        },
      });

      require('@cypress/code-coverage/task')(on, config);
      require('cypress-localstorage-commands/plugin')(on, config);
      return config;
    },
  },
});
