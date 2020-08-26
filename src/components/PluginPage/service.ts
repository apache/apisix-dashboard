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
import { request } from 'umi';

import { JSONSchema7 } from 'json-schema';

import { PLUGIN_MAPPER_SOURCE } from './data';

export const fetchPluginList = () => request<string[]>('/plugins');

export const getList = (plugins: PluginPage.PluginData) => {
  const PLUGIN_BLOCK_LIST = Object.entries(PLUGIN_MAPPER_SOURCE)
    .filter(([, value]) => value.hidden)
    .flat()
    .filter((item) => typeof item === 'string');

  return fetchPluginList().then((data) => {
    const names = data.filter((name) => !PLUGIN_BLOCK_LIST.includes(name));

    const activeNameList = Object.keys(plugins);
    const inactiveNameList = names.filter((name) => !activeNameList.includes(name));

    return {
      activeList: activeNameList.map((name) => ({ name, ...PLUGIN_MAPPER_SOURCE[name] })),
      inactiveList: inactiveNameList.map((name) => ({ name, ...PLUGIN_MAPPER_SOURCE[name] })),
    };
  });
};

export const fetchPluginSchema = (name: string): Promise<JSONSchema7> =>
  request(`/schema/plugins/${name}`);
