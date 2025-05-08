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
import { queryOptions, skipToken } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import type { PluginConfig } from '@/components/form-slice/FormItemPlugins/PluginEditorDrawer';
import {
  API_GLOBAL_RULES,
  API_PLUGIN_METADATA,
  API_PLUGINS,
  API_PLUGINS_LIST,
} from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';

export const putGlobalRuleReq = (data: APISIXType['GlobalRulePut']) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['GlobalRulePut'],
    APISIXType['RespGlobalRuleDetail']
  >(`${API_GLOBAL_RULES}/${id}`, rest);
};

export const getGlobalRuleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['global_rule', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespGlobalRuleDetail']>(
          `${API_GLOBAL_RULES}/${id}`
        )
        .then((v) => v.data),
  });

export type NeedPluginSchema = {
  schema: APISIXType['PluginSchemaKeys'];
};

export const getPluginsListQueryOptions = () => {
  return queryOptions({
    queryKey: ['plugins-list'],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespPluginList']>(API_PLUGINS_LIST)
        .then((v) => v.data),
  });
};

export const getPluginsListWithSchemaQueryOptions = (
  props: APISIXType['PluginsQuery'] & NeedPluginSchema = { schema: 'schema' }
) => {
  const { subsystem, schema } = props;
  return queryOptions({
    queryKey: ['plugins-list-with-schema', subsystem, schema],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespPlugins']>(API_PLUGINS, {
          params: { subsystem, all: true },
        })
        .then((v) => {
          const data = Object.entries(v.data);
          const names = [];
          for (const [name, config] of data) {
            if (config[schema]) {
              names.push(name);
            }
          }
          return { names, originObj: v.data };
        }),
  });
};

export const getPluginSchemaQueryOptions = (
  name: string,
  enabled: boolean = true
) => {
  return queryOptions({
    queryKey: ['plugin-schema', name],
    queryFn: name
      ? () =>
          req
            .get<unknown, APISIXType['RespPluginSchema']>(
              `${API_PLUGINS}/${name}`
            )
            .then((v) => v.data)
      : skipToken,
    enabled,
  });
};

export const putPluginMetadataReq = (props: PluginConfig) => {
  const { name, config } = props;
  return req.put<
    APISIXType['PluginMetadataPut'],
    APISIXType['RespPluginMetadataDetail']
  >(`${API_PLUGIN_METADATA}/${name}`, config);
};

export const deletePluginMetadataReq = (name: string) => {
  return req.delete<unknown, APISIXType['RespPluginMetadataDetail']>(
    `${API_PLUGIN_METADATA}/${name}`
  );
};

export const getPluginMetadataQueryOptions = (
  plugin_name: string,
  headers?: AxiosRequestConfig<unknown>['headers']
) =>
  queryOptions({
    queryKey: ['plugin_metadata', plugin_name],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespPluginMetadataDetail']>(
          `${API_PLUGIN_METADATA}/${plugin_name}`,
          { headers }
        )
        .then((v) => v.data),
  });
