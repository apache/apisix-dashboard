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

import type { SSLPostType } from '@/components/form-slice/FormPartSSL/schema';
import { API_SSLS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getSSLListReq = (req: AxiosInstance, params: PageSearchType) =>
  req
    .get<unknown, APISIXType['RespSSLList']>(API_SSLS, {
      params,
    })
    .then((v) => v.data);

export const getSSLReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespSSLDetail']>(`${API_SSLS}/${id}`)
    .then((v) => v.data);

export const putSSLReq = (req: AxiosInstance, data: APISIXType['SSL']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['SSL'], APISIXType['RespSSLDetail']>(
    `${API_SSLS}/${id}`,
    rest
  );
};

export const postSSLReq = (req: AxiosInstance, data: SSLPostType) =>
  req.post<APISIXType['SSL'], APISIXType['RespSSLDetail']>(API_SSLS, data);

export const deleteAllSSLs = async (req: AxiosInstance) => {
  const { PAGE_SIZE_MIN, PAGE_SIZE_MAX } = await import('@/config/constant');
  const totalRes = await getSSLListReq(req, {
    page: 1,
    page_size: PAGE_SIZE_MIN,
  });
  const total = totalRes.total;
  if (total === 0) return;
  for (let times = Math.ceil(total / PAGE_SIZE_MAX); times > 0; times--) {
    const res = await getSSLListReq(req, {
      page: 1,
      page_size: PAGE_SIZE_MAX,
    });
    await Promise.all(
      res.list.map((d) => req.delete(`${API_SSLS}/${d.value.id}`))
    );
  }
};
