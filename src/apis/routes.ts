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

import type { RoutePostType } from '@/components/form-slice/FormPartRoute/schema';
import { API_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getRouteListReq = (req: AxiosInstance, params: PageSearchType) =>
  req
    .get<undefined, APISIXType['RespRouteList']>(API_ROUTES, { params })
    .then((v) => v.data);

export const getRouteReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespRouteDetail']>(`${API_ROUTES}/${id}`)
    .then((v) => v.data);

export const putRouteReq = (req: AxiosInstance, data: APISIXType['Route']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Route'], APISIXType['RespRouteDetail']>(
    `${API_ROUTES}/${id}`,
    rest
  );
};

export const postRouteReq = (req: AxiosInstance, data: RoutePostType) =>
  req.post<unknown, APISIXType['RespRouteDetail']>(API_ROUTES, data);

export const deleteAllRoutes = async (req: AxiosInstance) => {
  const res = await getRouteListReq(req, {
    page: 1,
    page_size: 1000,
    pageSize: 1000,
  });
  if (res.total === 0) return;
  return await Promise.all(
    res.list.map((d) => req.delete(`${API_ROUTES}/${d.value.id}`))
  );
};
