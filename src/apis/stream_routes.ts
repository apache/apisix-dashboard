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

import type { StreamRoutePostType } from '@/components/form-slice/FormPartStreamRoute/schema';
import {
  API_STREAM_ROUTES,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
} from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

import type { WithServiceIdFilter } from './routes';

export const getStreamRouteListReq = (
  req: AxiosInstance,
  params: WithServiceIdFilter
) =>
  req
    .get<unknown, APISIXType['RespStreamRouteList']>(API_STREAM_ROUTES, {
      params,
    })
    .then((v) => v.data);

export const getStreamRouteReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespStreamRouteDetail']>(
      `${API_STREAM_ROUTES}/${id}`
    )
    .then((v) => v.data);

export const putStreamRouteReq = (
  req: AxiosInstance,
  data: APISIXType['StreamRoute']
) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['StreamRoute'],
    APISIXType['RespStreamRouteDetail']
  >(`${API_STREAM_ROUTES}/${id}`, rest);
};

export const postStreamRouteReq = (
  req: AxiosInstance,
  data: StreamRoutePostType
) =>
  req.post<unknown, APISIXType['RespStreamRouteDetail']>(
    API_STREAM_ROUTES,
    data
  );

export const deleteAllStreamRoutes = async (req: AxiosInstance) => {
  // APISIX deployments without `apisix.proxy_mode: http&stream` reject the
  // list endpoint with 400 "stream mode is disabled". Treat that as "no
  // stream routes" so the helper (and `deleteAllServices`, which chains
  // through it) doesn't bring the whole cleanup path down with it.
  const totalRes = await getStreamRouteListReq(req, {
    page: 1,
    page_size: PAGE_SIZE_MIN,
  }).catch(
    (e: {
      response?: { status?: number; data?: { error_msg?: string } };
      message?: string;
    }) => {
      // Both shapes occur depending on the request adapter: the dashboard's
      // axios interceptor surfaces `e.response.data.error_msg`, while the
      // e2e Playwright fetch adapter throws an Error whose `.message`
      // includes the upstream status and body text.
      // Require BOTH a 400-class status (or no response at all) AND the
      // "stream mode" text — a string match alone could swallow unrelated
      // errors whose messages happen to mention stream mode.
      const status = e?.response?.status;
      const isStreamGate =
        status === undefined || (status >= 400 && status < 500);
      const haystack = `${e?.response?.data?.error_msg ?? ''} ${e?.message ?? ''}`;
      if (isStreamGate && /stream mode/i.test(haystack)) {
        return { total: 0, list: [] } as Awaited<
          ReturnType<typeof getStreamRouteListReq>
        >;
      }
      throw e;
    }
  );
  const total = totalRes.total;
  if (total === 0) return;
  for (let times = Math.ceil(total / PAGE_SIZE_MAX); times > 0; times--) {
    const res = await getStreamRouteListReq(req, {
      page: 1,
      page_size: PAGE_SIZE_MAX,
    });
    await Promise.all(
      res.list.map((d) => req.delete(`${API_STREAM_ROUTES}/${d.value.id}`))
    );
  }
};
