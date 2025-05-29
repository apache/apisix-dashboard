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
import type { AxiosInstance } from 'axios';

import { API_SERVICES, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export type ServicePostType = APISIXType['ServicePost'];

export const getServiceListReq = (req: AxiosInstance, params: PageSearchType) =>
  req
    .get<unknown, APISIXType['RespServiceList']>(API_SERVICES, {
      params,
    })
    .then((v) => v.data);

export const getServiceReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespServiceDetail']>(`${API_SERVICES}/${id}`)
    .then((v) => v.data);

export const putServiceReq = (
  req: AxiosInstance,
  data: APISIXType['Service']
) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Service'], APISIXType['RespServiceDetail']>(
    `${API_SERVICES}/${id}`,
    rest
  );
};

export const postServiceReq = (req: AxiosInstance, data: ServicePostType) =>
  req.post<ServicePostType, APISIXType['RespServiceDetail']>(
    API_SERVICES,
    data
  );

export const deleteAllServices = async (req: AxiosInstance) => {
  const totalRes = await getServiceListReq(req, {
    page: 1,
    page_size: PAGE_SIZE_MIN,
  });
  const total = totalRes.total;
  if (total === 0) return;
  for (let times = Math.ceil(total / PAGE_SIZE_MAX); times > 0; times--) {
    const res = await getServiceListReq(req, {
      page: 1,
      page_size: PAGE_SIZE_MAX,
    });
    await Promise.all(
      res.list.map((d) => req.delete(`${API_SERVICES}/${d.value.id}`))
    );
  }
};
