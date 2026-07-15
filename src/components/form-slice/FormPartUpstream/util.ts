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
import { produce } from 'immer';
import { isNotEmpty } from 'rambdax';

import type { APISIXType } from '@/types/schema/apisix';

import type { FormPartUpstreamType } from './schema';

export const produceToUpstreamForm = (
  upstream: Partial<APISIXType['Upstream']>,
  /** default to upstream */
  base: object = upstream
) =>
  produce(base, (d: FormPartUpstreamType) => {
    d.__checksEnabled = !!upstream.checks && isNotEmpty(upstream.checks);
    d.__checksPassiveEnabled =
      !!upstream.checks?.passive && isNotEmpty(upstream.checks.passive);
  });
export const produceToNestedUpstreamForm = produce((draft: Record<string, unknown>) => {
  const d = draft as Record<string, unknown> & { 
    upstream?: Record<string, unknown>;
    checks?: { passive?: unknown };
    __checksEnabled?: boolean;
    __checksPassiveEnabled?: boolean;
  };
  if (d.upstream && typeof d.upstream === 'object' && !Array.isArray(d.upstream)) {
    const upstream = d.upstream as Partial<APISIXType['Upstream']>;
    d.upstream = produceToUpstreamForm(upstream, upstream) as Record<string, unknown>;
    // The health-check switches live at the form ROOT: FormSectionChecks
    // registers `__checksEnabled` unprefixed and reads it from the root.
    // They must be derived from the nested upstream's checks — otherwise a
    // reset with this producer leaves them undefined, the checks section
    // renders "disabled", its inputs unmount, and `shouldUnregister: true`
    // silently drops `upstream.checks` from the next PUT (#3414).
    d.__checksEnabled = !!upstream.checks && isNotEmpty(upstream.checks);
    d.__checksPassiveEnabled =
      !!upstream.checks?.passive && isNotEmpty(upstream.checks.passive);
  }
  // Also handle top-level checks if they exist
  if (d.checks) {
    d.__checksEnabled = !!d.checks && isNotEmpty(d.checks);
    d.__checksPassiveEnabled = !!d.checks?.passive && isNotEmpty(d.checks.passive);
  }
});

const isAllUndefined = (obj: Record<string, unknown>) =>
  Object.values(obj).every(
    (v) => v === undefined || v === null || v === '' || Number.isNaN(v)
  );

export const produceRmEmptyUpstreamFields = produce(
  (
    draft: {
      timeout?: Record<string, unknown>;
      keepalive_pool?: Record<string, unknown>;
      tls?: Record<string, unknown>;
      upstream?: {
        timeout?: Record<string, unknown>;
        keepalive_pool?: Record<string, unknown>;
        tls?: Record<string, unknown>;
      };
    } & Record<string, unknown>
  ) => {
    if (draft.timeout && isAllUndefined(draft.timeout)) {
      delete draft.timeout;
    }
    if (draft.keepalive_pool && isAllUndefined(draft.keepalive_pool)) {
      delete draft.keepalive_pool;
    }
    if (draft.tls && isAllUndefined(draft.tls)) {
      delete draft.tls;
    }

    if (draft.upstream) {
      const u = draft.upstream as Record<string, unknown>;
      // only strip these when EMPTY: the Admin API rejects e.g. name: ''
      // (minLength 1) but accepts and stores non-empty name/desc/labels
      // on an inline upstream — unconditional deletes silently erased
      // stored values on every edit-save and discarded form input (#3417)
      if (!u.name) delete u.name;
      if (!u.desc) delete u.desc;
      if (!u.labels || Object.keys(u.labels as object).length === 0) {
        delete u.labels;
      }

      if (draft.upstream.timeout && isAllUndefined(draft.upstream.timeout)) {
        delete draft.upstream.timeout;
      }
      if (
        draft.upstream.keepalive_pool &&
        isAllUndefined(draft.upstream.keepalive_pool)
      ) {
        delete draft.upstream.keepalive_pool;
      }
      if (draft.upstream.tls && isAllUndefined(draft.upstream.tls)) {
        delete draft.upstream.tls;
      }
    }
  }
);
