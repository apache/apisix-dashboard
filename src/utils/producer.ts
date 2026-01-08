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

export const rmDoubleUnderscoreKeys = (obj: object) => {
  Object.keys(obj).forEach((key) => {
    const k = key as keyof typeof obj;
    if ((key as string).startsWith('__')) return delete obj[k];
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      (obj[k] as object) = rmDoubleUnderscoreKeys(obj[k]);
    }
  });
  return obj;
};

export const produceRmDoubleUnderscoreKeys = produce((draft) => {
  rmDoubleUnderscoreKeys(draft);
});

// Preserve plugin entries with empty configs before cleaning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const producePreservePlugins = produce((draft: any) => {
  if (draft.plugins && typeof draft.plugins === 'object') {
    // Mark plugin configs to preserve them from being cleaned
    Object.keys(draft.plugins).forEach((pluginName) => {
      const config = draft.plugins[pluginName];
      if (
        config &&
        typeof config === 'object' &&
        !Array.isArray(config) &&
        Object.keys(config).length === 0
      ) {
        // Add a marker that will be removed later
        draft.plugins[pluginName] = { __preserve: true };
      }
    });
  }
});

// Remove the preserve markers after cleaning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const produceRemovePreserveMarkers = produce((draft: any) => {
  if (draft.plugins && typeof draft.plugins === 'object') {
    Object.keys(draft.plugins).forEach((pluginName) => {
      const config = draft.plugins[pluginName];
      if (
        config &&
        typeof config === 'object' &&
        config.__preserve === true &&
        Object.keys(config).length === 1
      ) {
        // Restore to empty object
        draft.plugins[pluginName] = {};
      }
    });
  }
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
        producePreservePlugins, // Mark empty plugin configs before cleaning
        produceDeepCleanEmptyKeys(),
        produceRemovePreserveMarkers // Restore empty plugin configs after cleaning
      )(draft) as never;
    }) as T;
};
