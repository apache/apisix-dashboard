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

import axios, { type AxiosInstance } from 'axios';

import { API_UPSTREAMS, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getUpstreamListReq = (
  req: AxiosInstance,
  params: PageSearchType
) =>
  req
    .get<undefined, APISIXType['RespUpstreamList']>(API_UPSTREAMS, { params })
    .then((v) => v.data);

export const getUpstreamReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespUpstreamDetail']>(`${API_UPSTREAMS}/${id}`)
    .then((v) => v.data);

export const postUpstreamReq = (
  req: AxiosInstance,
  data: Partial<APISIXType['Upstream']>
) =>
  req.post<APISIXType['Upstream'], APISIXType['RespUpstreamDetail']>(
    API_UPSTREAMS,
    data
  );

export const putUpstreamReq = (
  req: AxiosInstance,
  data: APISIXType['Upstream']
) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Upstream'], APISIXType['RespUpstreamDetail']>(
    `${API_UPSTREAMS}/${id}`,
    rest
  );
};

export const deleteAllUpstreams = async (req: AxiosInstance) => {
  // Retry wrapper to handle potential transient failures (e.g., 500 Internal Server Error) when fetching upstream list.
  // This is particularly useful in E2E tests where rapid creation/deletion might cause temporary instability.
  const retry = async <T>(fn: () => Promise<T>, times = 3, delay = 500) => {
    let lastErr: unknown;
    for (let i = 0; i < times; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        // small backoff between attempts
         
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  };

  // Fetch the total count first to determine how many pages of deletions are needed.
  // Using PAGE_SIZE_MIN (typically 1) is efficient just to get the 'total' count metadata.
  const totalRes = await retry(() =>
    getUpstreamListReq(req, {
      page: 1,
      page_size: PAGE_SIZE_MIN,
    })
  );
  const total = totalRes.total;
  if (total === 0) return;

  // Iterate through all pages and delete upstreams in batches.
  // We calculate the number of iterations based on the total count and maximum page size.
  for (let times = Math.ceil(total / PAGE_SIZE_MAX); times > 0; times--) {
    const res = await retry(() =>
      getUpstreamListReq(req, {
        page: 1,
        page_size: PAGE_SIZE_MAX,
      })
    );
    // Delete all upstreams in the current batch concurrently.
    await Promise.all(
      res.list.map((d) =>
        retry(async () => {
          try {
            await req.delete(`${API_UPSTREAMS}/${d.value.id}`);
          } catch (err) {
            // Ignore 404 errors as the resource might have been deleted
            if (axios.isAxiosError(err) && err.response?.status === 404) return;
            throw err;
          }
        })
      )
    );
  }
};
