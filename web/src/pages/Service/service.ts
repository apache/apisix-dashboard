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
import { transformData } from './transform';

export const fetchList = ({ current = 1, pageSize = 10, ...res }) =>
  request('/services', {
    params: {
      name: res.name,
      page: current,
      page_size: pageSize,
    },
  }).then(({ data }) => ({
    data: data.rows,
    total: data.total_size,
  }));

export const create = (data: ServiceModule.Entity) =>
  request('/services', {
    method: 'POST',
    data: transformData(data),
  });

export const update = (serviceId: string, data: ServiceModule.Entity) =>
  request(`/services/${serviceId}`, {
    method: 'PUT',
    data: transformData(data),
  });

export const remove = (serviceId: string) =>
  request(`/services/${serviceId}`, { method: 'DELETE' });

export const fetchItem = (serviceId: number) =>
  request(`/services/${serviceId}`).then((data) => data);
