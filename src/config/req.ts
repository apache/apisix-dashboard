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

import { notifications } from '@mantine/notifications';
import axios, { AxiosError, type AxiosResponse, HttpStatusCode } from 'axios';
import { getDefaultStore } from 'jotai';
import { stringify } from 'qs';

import {
  API_HEADER_KEY,
  API_PREFIX,
  API_TIMEOUT_MS,
  SKIP_INTERCEPTOR_HEADER,
} from '@/config/constant';
import { adminKeyAtom, isSettingsOpenAtom } from '@/stores/global';

export const req = axios.create({ timeout: API_TIMEOUT_MS });

req.interceptors.request.use((conf) => {
  conf.paramsSerializer = (p) => {
    // from { filter: { service_id: 1 } }
    // to `filter=service_id%3D1`
    if (p.filter) {
      p.filter = stringify(p.filter);
    }
    return stringify(p, {
      arrayFormat: 'repeat',
    });
  };
  conf.baseURL = API_PREFIX;
  const adminKey = getDefaultStore().get(adminKeyAtom);
  conf.headers.set(API_HEADER_KEY, adminKey);
  return conf;
});

export type APISIXRespErr = {
  error_msg?: string;
  message?: string;
};

/**
 * use request header `[SKIP_INTERCEPTOR_HEADER]: ['404', ...]` to skip interceptor for specific status code.
 */
const matchSkipInterceptor = (err: AxiosError) => {
  const interceptors = err.config?.headers?.[SKIP_INTERCEPTOR_HEADER] || [];
  const status = err.response?.status;
  return interceptors.some((v: string) => v === String(status));
};

req.interceptors.response.use(
  (res) => {
    // it's a apisix design
    // when list is empty, it will be a object
    // but we need a array
    if (
      res.data?.list &&
      !Array.isArray(res.data.list) &&
      Object.keys(res.data.list).length === 0
    ) {
      res.data.list = [];
    }
    return res;
  },
  (err) => {
    if (err.response) {
      if (matchSkipInterceptor(err)) return Promise.reject(err);
      const res = err.response as AxiosResponse<APISIXRespErr>;
      const d = res.data;
      const message = d?.error_msg || d?.message || `Error status: ${res.status}`;
      notifications.show({
        id: message,
        message,
        color: 'red',
      });
      // Requires to enter admin key at 401.
      // Note: do NOT resolve with fabricated data here — callers must take
      // their normal error path. Resolving `{ data: {} }` made a 401'd
      // DELETE/PUT show success toasts and fed `{}` into `onSuccess`
      // handlers and suspense queries, crashing detail/add pages.
      if (res.status === HttpStatusCode.Unauthorized) {
        getDefaultStore().set(isSettingsOpenAtom, true);
      }
    } else if (!axios.isCancel(err)) {
      // Network-level failure: no response at all (backend down/unreachable,
      // timeout, DNS error, CORS preflight failure). Toast here — the single
      // choke point every request flows through — so raw calls (e.g.
      // DeleteResourceBtn) and react-query paths all surface feedback.
      // `matchSkipInterceptor` can't apply: there is no status code to match.
      // `id` dedupes retries and concurrent failures into one notification.
      const message = err.message || 'Network Error';
      notifications.show({
        id: message,
        message,
        color: 'red',
      });
    }
    return Promise.reject(err);
  }
);
