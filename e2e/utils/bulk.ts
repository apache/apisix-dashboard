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

// Bulk-data helpers: seed and tear down N resources directly via the Admin
// API (NOT via the UI). The UI side is the system under test — keeping the
// data prep on the API side decouples the bulk-render assertions from the
// add-form behavior.

import { API_ROUTES, API_UPSTREAMS, PAGE_SIZE_MAX } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

import { e2eReq } from './req';

const CONCURRENCY = 20;

const runBatched = async <T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  concurrency = CONCURRENCY
): Promise<void> => {
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    await Promise.all(slice.map(fn));
  }
};

export type BulkRouteSeedOptions = {
  count: number;
  prefix?: string;
  uriPrefix?: string;
  host?: string;
};

/**
 * Create N routes via PUT with explicit IDs ("{prefix}-{i}"). Returns the
 * names so a test can spot-check individual rows.
 */
export const bulkCreateRoutes = async (
  opts: BulkRouteSeedOptions
): Promise<string[]> => {
  const {
    count,
    prefix = 'bulk',
    uriPrefix = '/bulk',
    host = 'bulk.local',
  } = opts;
  const ids = Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
  await runBatched(ids, async (id) => {
    const body: APISIXType['Route'] = {
      name: id,
      uri: `${uriPrefix}/${id}`,
      methods: ['GET'],
      upstream: {
        type: 'roundrobin',
        nodes: { [`${host}:80`]: 1 },
      },
    } as APISIXType['Route'];
    await e2eReq.put(`${API_ROUTES}/${id}`, body);
  });
  return ids;
};

/**
 * Delete every route whose ID starts with `prefix`.
 */
export const bulkDeleteRoutesByPrefix = async (
  prefix = 'bulk'
): Promise<number> => {
  let removed = 0;
  // Paginate just in case the prefix bucket is enormous.
  let page = 1;
  while (true) {
    const resp = await e2eReq.get(API_ROUTES, {
      params: { page, page_size: PAGE_SIZE_MAX },
    });
    const list = (
      resp.data as {
        list: Array<{ value: { id?: string; name?: string } }>;
        total: number;
      }
    ).list;
    const matching = list.filter(
      (item) =>
        (item.value.id && item.value.id.startsWith(prefix)) ||
        (item.value.name && item.value.name.startsWith(prefix))
    );
    if (matching.length === 0) break;
    await runBatched(matching, async (item) => {
      await e2eReq.delete(`${API_ROUTES}/${item.value.id}`);
      removed++;
    });
    if (list.length < PAGE_SIZE_MAX) break;
    page++;
  }
  return removed;
};

export type BulkUpstreamSeedOptions = {
  count: number;
  prefix?: string;
};

export const bulkCreateUpstreams = async (
  opts: BulkUpstreamSeedOptions
): Promise<string[]> => {
  const { count, prefix = 'bulk-up' } = opts;
  const ids = Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
  await runBatched(ids, async (id) => {
    const body: APISIXType['Upstream'] = {
      name: id,
      nodes: [{ host: `${id}.local`, port: 80, weight: 1 }],
    } as APISIXType['Upstream'];
    await e2eReq.put(`${API_UPSTREAMS}/${id}`, body);
  });
  return ids;
};

export const bulkDeleteUpstreamsByPrefix = async (
  prefix = 'bulk-up'
): Promise<number> => {
  let removed = 0;
  let page = 1;
  while (true) {
    const resp = await e2eReq.get(API_UPSTREAMS, {
      params: { page, page_size: PAGE_SIZE_MAX },
    });
    const list = (
      resp.data as { list: Array<{ value: { id?: string; name?: string } }> }
    ).list;
    const matching = list.filter(
      (item) =>
        (item.value.id && item.value.id.startsWith(prefix)) ||
        (item.value.name && item.value.name.startsWith(prefix))
    );
    if (matching.length === 0) break;
    await runBatched(matching, async (item) => {
      await e2eReq.delete(`${API_UPSTREAMS}/${item.value.id}`);
      removed++;
    });
    if (list.length < PAGE_SIZE_MAX) break;
    page++;
  }
  return removed;
};
