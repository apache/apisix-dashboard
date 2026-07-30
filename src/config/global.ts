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
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { HttpStatusCode, isAxiosError } from 'axios';

import { routeTree } from '@/routeTree.gen';
import { isNotFoundError } from '@/utils/error';

import { BASE_PATH } from './constant';

export const router = createRouter({ routeTree, basepath: BASE_PATH });

export type Router = typeof router;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // retrying a 401 cannot succeed until the user fixes the admin
        // key; fail fast so the settings modal appears immediately
        if (
          isAxiosError(error) &&
          error.response?.status === HttpStatusCode.Unauthorized
        ) {
          return false;
        }
        // A 404 means the resource does not exist; no number of retries
        // changes that. This is also load-bearing for the detail pages'
        // not-found state: a retry sequence PAUSES while the tab is hidden
        // (query-core retryer `canContinue` -> focusManager), and a paused
        // query never reaches `error`, so nothing is thrown and the page
        // would sit on its loading skeleton indefinitely.
        if (isNotFoundError(error)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
