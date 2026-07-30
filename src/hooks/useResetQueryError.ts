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
import {
  useQueryClient,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { isNotFoundError } from '@/utils/error';

/**
 * Stops a failure that is already on screen from being replayed later.
 *
 * Pages throw from `useSuspenseQuery` during render, and react-query keeps
 * the failure: while its error-reset boundary is un-reset,
 * `errorBoundaryUtils.ensurePreventErrorBoundaryRetry` sets
 * `retryOnMount = false`, and `queryObserver.shouldLoadOnMount` then refuses
 * to fetch an errored query — so the next mount re-throws the cached error
 * instead of retrying the load, for as long as the entry lives (`gcTime`,
 * five minutes past its last observer).
 *
 * Every error surface must call this. Skipping it makes that surface a dead
 * end: its Retry loops straight back to itself.
 *
 * A 404 needs more than the reset. `reset()` only flips a flag that the very
 * next query mount clears again (`useBaseQuery` ->
 * `useClearResetErrorBoundary`) — one trip through any list page does it —
 * and a stale 404 is not merely an unhelpful screen: it is a false statement
 * about the user's data. Delete a resource, open its URL, re-create it under
 * the same id, and the panel would still call it deleted. So the cache entry
 * that carries this 404 is dropped outright, and the next mount starts over.
 *
 * Only 404s. Every other failure keeps its entry on purpose: recovering from
 * a wrong admin key depends on `SettingsModal`'s debounced
 * `refetchQueries()` reaching exactly these observer-less error-state
 * queries, and `Query.isDisabled()` excludes any query that has not
 * completed a fetch — so a dropped (or `resetQueries`-reset) entry is one
 * that refresh can never reach again. A 404 is not what an admin key fixes.
 */
export const useResetQueryError = (error: unknown) => {
  const queryClient = useQueryClient();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryErrorResetBoundary.reset();
    if (!isNotFoundError(error)) return;
    queryClient.removeQueries({
      predicate: (query) => query.state.error === error,
    });
  }, [error, queryClient, queryErrorResetBoundary]);
};
