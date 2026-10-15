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
import { current, isDraft, produce } from 'immer';
import { equals, isNotEmpty } from 'rambdax';

import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { deepCleanEmptyKeys, rmDoubleUnderscoreKeys } from '@/utils/producer';

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

/**
 * What the inline upstream widgets register the moment they mount, before
 * the user has opened the section at all: FormItemScheme,
 * FormSectionLoadbalancing and FormSectionPassHost pass the first schema
 * option as their Select default, and the TLS `verify` Switch falls back to
 * false. Every other widget mounts empty (`''`, `undefined`, `{}`, `[]`),
 * which the cleaner already strips.
 *
 * Keep in step with those widgets: a new widget that registers a non-empty
 * default must be listed here, or an untouched section is sent again.
 */
const INLINE_UPSTREAM_MOUNT_DEFAULTS: Record<string, unknown> = {
  scheme: APISIX.UpstreamSchemeL7.options[0].value,
  type: APISIX.UpstreamBalancer.options[0].value,
  hash_on: APISIX.UpstreamHashOn.options[0].value,
  pass_host: APISIX.UpstreamPassHost.options[0].value,
  tls: { verify: false },
};

/**
 * True when an inline `upstream` holds nothing but what its widgets
 * registered on mount (#3395).
 *
 * The route / service / stream-route forms always render the inline upstream
 * section, so react-hook-form submits `upstream: { scheme: 'http', type:
 * 'roundrobin', hash_on: 'vars', pass_host: 'pass', tls: { verify: false } }`
 * for a section the user never opened. The Admin API rejects that — an
 * upstream needs nodes or discovery — so a plugins-only route (public-api)
 * could not be created, and one created through the Admin API could not be
 * edit-saved. Dropping such an upstream loses nothing: every value in it is
 * the gateway default anyway.
 *
 * Anything the user did supply (a node row, even an empty one; a different
 * scheme; a name; …) makes this false, and the upstream is sent as is for the
 * Admin API to judge — silently discarding input is the #3417 failure mode.
 */
export const isUntouchedInlineUpstream = (upstream: unknown): boolean => {
  if (!upstream || typeof upstream !== 'object' || Array.isArray(upstream)) {
    return false;
  }
  // read-only: a plain snapshot of a (possibly nested) immer draft, cleaned
  // into a fresh object so the caller's value is never touched
  const plain = isDraft(upstream) ? current(upstream) : upstream;
  const cleaned = deepCleanEmptyKeys(plain as Record<string, unknown>, {
    cleanInPlace: false,
  }) as Record<string, unknown>;
  rmDoubleUnderscoreKeys(cleaned);
  return Object.entries(cleaned).every(
    ([key, value]) =>
      Object.prototype.hasOwnProperty.call(
        INLINE_UPSTREAM_MOUNT_DEFAULTS,
        key
      ) && equals(INLINE_UPSTREAM_MOUNT_DEFAULTS[key], value)
  );
};

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
      } & Record<string, unknown>;
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

      // the section was never opened: only the widgets' mount-time defaults
      // are left, and the Admin API rejects an upstream with neither nodes
      // nor discovery — send no upstream at all (#3395)
      if (isUntouchedInlineUpstream(draft.upstream)) {
        delete draft.upstream;
      }
    }
  }
);
