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

import { DEFAULT_GLOBAL_RULE_ID } from '@/constants';

export const fetchList = (): Promise<{
  data: PluginModule.TransformedPlugin[];
  total: number;
}> =>
  request<{
    data: {
      plugins: Record<string, any>;
    };
  }>(`/global_rules/${DEFAULT_GLOBAL_RULE_ID}`).then(({ data }) => {
    const plugins = Object.entries(data.plugins || {})
      .filter(([, value]) => !value.disable)
      .map(([name, value]) => ({
        id: name,
        name,
        value,
      }));

    return {
      data: plugins,
      total: plugins.length,
    };
  });

export const createOrUpdate = (data: Partial<Omit<PluginModule.GlobalRule, 'id'>>) =>
  request(`/global_rules/${DEFAULT_GLOBAL_RULE_ID}`, {
    method: 'PUT',
    data: { id: DEFAULT_GLOBAL_RULE_ID, ...data },
  });

export const fetchPluginList = () => {
  return request<Res<PluginComponent.Meta[]>>('/plugins?all=true').then((data) => {
    return data.data;
  });
};
