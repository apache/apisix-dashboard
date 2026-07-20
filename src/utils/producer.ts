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
import { produce } from 'immer';
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

/**
 * Preserves plugin entries with empty config ({}) after deep cleaning.
 * APISIX plugins like key-auth have no required fields and are valid with {}.
 * deepCleanEmptyKeys would strip them, so we restore them from the original.
 */
export const produceRestoreEmptyPlugins = (original: object) =>
  produce((draft: Record<string, unknown>) => {
    const orig = original as Record<string, unknown>;
    if (orig.plugins && typeof orig.plugins === 'object') {
      const origPlugins = orig.plugins as Record<string, unknown>;
      const draftPlugins = (draft.plugins ?? {}) as Record<string, unknown>;
      Object.keys(origPlugins).forEach((name) => {
        if (!(name in draftPlugins)) {
          draftPlugins[name] = origPlugins[name];
        }
      });
      if (Object.keys(draftPlugins).length > 0) {
        draft.plugins = draftPlugins;
      }
    }
    // Restore discovery_args: {} if it was present in the original.
    // APISIX accepts empty discovery_args and deepCleanEmptyKeys would strip it.
    if (
      'discovery_args' in orig &&
      orig.discovery_args !== null &&
      typeof orig.discovery_args === 'object' &&
      Object.keys(orig.discovery_args as object).length === 0
    ) {
      (draft as Record<string, unknown>).discovery_args = {};
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
        produceDeepCleanEmptyKeys(),
        produceRestoreEmptyPlugins(val as object)
      )(draft) as never;
    }) as T;
};
