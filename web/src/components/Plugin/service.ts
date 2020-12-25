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
import { omit } from 'lodash';
import { request } from 'umi';

export const fetchList = () => {
  return request<Res<PluginComponent.Meta[]>>('/plugins?all=true').then(data => {
    return data.data;
  })
};

/**
 * cache plugin schema by schemaType
 * default schema is route for plugins in route
 * support schema: consumer for plugins in consumer
 */
const cachedPluginSchema: Record<string, object> = {
  route: {},
  consumer: {},
};
export const fetchSchema = async (
  name: string,
  schemaType: PluginComponent.Schema,
): Promise<any> => {
  if (!cachedPluginSchema[schemaType][name]) {
    const queryString = schemaType !== 'route' ? `?schema_type=${schemaType}` : '';
    cachedPluginSchema[schemaType][name] = (
      await request(`/schema/plugins/${name}${queryString}`)
    ).data;
    // for plugins schema returned with properties: [], which will cause parse error
    if (JSON.stringify(cachedPluginSchema[schemaType][name].properties) === '[]') {
      cachedPluginSchema[schemaType][name] = omit(
        cachedPluginSchema[schemaType][name],
        'properties',
      );
    }
  }
  return cachedPluginSchema[schemaType][name];
};
