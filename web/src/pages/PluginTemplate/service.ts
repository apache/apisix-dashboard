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

import { transformLabelList } from '@/helpers';

export const fetchList = ({ current = 1, pageSize = 10, ...res }) => {
  const { labels = [] } = res;

  return request('/plugin_configs', {
    params: {
      search: res.desc,
      label: labels.join(','),
      page: current,
      page_size: pageSize,
    },
  }).then(({ data }) => {
    return {
      data: data.rows,
      total: data.total_size,
    };
  });
};

export const remove = (rid: string) => request(`/plugin_configs/${rid}`, { method: 'DELETE' });

export const fetchItem = (id: string) =>
  request<{ data: PluginTemplateModule.ResEntity }>(`/plugin_configs/${id}`);

export const create = (data: PluginTemplateModule.Entity) =>
  request('/plugin_configs', {
    method: 'POST',
    data,
  });

export const update = (id: string, data: PluginTemplateModule.Entity) =>
  request(`/plugin_configs/${id}`, {
    method: 'PATCH',
    data,
  });

export const fetchLabelList = () =>
  request('/labels/plugin_config').then(({ data }) => transformLabelList(data.rows) as LabelList);
