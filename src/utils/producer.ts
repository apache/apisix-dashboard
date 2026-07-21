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
import { clean, type ICleanerOptions } from 'fast-clean';
import { current, isDraft, produce } from 'immer';
import { pipe } from 'rambdax';

import { produceTime } from './form-producer';

export const deepCleanEmptyKeys = <T extends object>(
  obj: T,
  opts?: ICleanerOptions
) =>
  clean(obj, {
    nullCleaner: true,
    cleanInPlace: true,
    ...opts,
  });

export const produceDeepCleanEmptyKeys = (opts: ICleanerOptions = {}) =>
  produce((draft) => {
    deepCleanEmptyKeys(draft, opts);
  });

/** plain deep snapshot of a value that may be an immer draft */
const snapshot = <T>(v: T): T => (isDraft(v) ? (current(v as object) as T) : v);

const isEmptyObject = (v: unknown): v is object =>
  !!v && typeof v === 'object' && Object.keys(v).length === 0;

/**
 * Deep-clean the draft while preserving values the cleaner must not own
 * (#3417):
 *
 * - plugin configs are user-authored JSON, detached before the clean and
 *   reattached VERBATIM: the gateway is the only judge of empty members
 *   ({} / [] / "" / null) — loose-schema plugins accept and store them,
 *   strict ones reject with a descriptive 400 (both verified against a
 *   live Admin API). The old whole-entry-only restore silently removed
 *   empties inside partially-surviving configs (#3269/#3277 siblings).
 * - discovery_args: {} is meaningful and accepted by the gateway;
 *   preserved at the root (upstreams page, #3376) and on an inline
 *   upstream (routes/services — the #3376 fix missed the nested case).
 *
 * Everything happens inside ONE draft with plain snapshots — a restore
 * stage that closed over the pipeline's original value crashed under
 * nested pipeProduce composition (the routes detail page composes
 * produceRoute, itself a pipeProduce, as a stage of another pipeProduce,
 * so inner stages receive the outer draft, not a plain value).
 */
export const produceCleanPreservingUserValues = (opts: ICleanerOptions = {}) =>
  produce((draft: Record<string, unknown>) => {
    const plugins = snapshot(draft.plugins);
    const rootDiscoveryArgs = snapshot(draft.discovery_args);
    const upstreamDiscoveryArgs = snapshot(
      (draft.upstream as Record<string, unknown> | undefined)?.discovery_args
    );
    delete draft.plugins;
    deepCleanEmptyKeys(draft, opts);
    if (plugins && typeof plugins === 'object') {
      draft.plugins = plugins;
    }
    if (isEmptyObject(rootDiscoveryArgs)) {
      draft.discovery_args = {};
    }
    const upstream = draft.upstream as Record<string, unknown> | undefined;
    if (upstream && isEmptyObject(upstreamDiscoveryArgs)) {
      upstream.discovery_args = {};
    }
  });

export const rmDoubleUnderscoreKeys = (obj: object) => {
  Object.keys(obj).forEach((key) => {
    const k = key as keyof typeof obj;
    if ((key as string).startsWith('__')) return delete obj[k];
    // typeof null === 'object': recursing into null threw at Object.keys.
    // Nulls are the downstream null-cleaner's job, not ours (#3417).
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      (obj[k] as object) = rmDoubleUnderscoreKeys(obj[k]);
    }
  });
  return obj;
};

export const produceRmDoubleUnderscoreKeys = produce((draft) => {
  rmDoubleUnderscoreKeys(draft);
});

/**
 * FIXME: type error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pipeProduce = (...funcs: ((a: any) => unknown)[]) => {
  return <T>(val: T) =>
    produce(val, (draft) => {
      const fs = funcs;
      return pipe(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ...fs,
        produceRmDoubleUnderscoreKeys,
        produceTime,
        produceCleanPreservingUserValues()
      )(draft) as never;
    }) as T;
};
