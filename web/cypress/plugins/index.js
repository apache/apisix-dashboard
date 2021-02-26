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
import * as globby from 'globby';

/**
 * @type {Cypress.PluginConfig}
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    findFile(mask) {
      if (!mask) {
        throw new Error('Missing a file mask to seach');
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
  return config;
};
