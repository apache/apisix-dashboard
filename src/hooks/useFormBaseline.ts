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
import { useCallback, useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * What the form held once its widgets had mounted — the reference point
 * for "has the user changed anything".
 *
 * `formState.defaultValues` is not that point. Several widgets register a
 * value of their own the moment they mount (a Select's first option, a
 * Switch's `false`, the priority NumberInput's `0`), so on every add page
 * `getValues()` differs from the defaults before the user has touched
 * anything, and on every edit page it differs wherever the stored object
 * omits a field. Comparing against the defaults flags such pristine forms
 * as dirty — in production only: under StrictMode's double effects
 * react-hook-form's `shouldUnregister` cleanup wipes the mount-time values
 * again, which is why `vite dev` and the old development-React e2e image
 * never showed it (#3395).
 *
 * The snapshot is taken after mount and again after every `reset(values)`:
 * the detail pages reset once their data arrives, and `reset` replaces
 * `formState.defaultValues`, which is what the effect keys on. By the time
 * the effect runs the widgets have re-registered into the fresh values.
 * It is a deep copy — react-hook-form mutates nested objects of the live
 * values in place on change.
 */
export const useFormBaseline = <T extends FieldValues>(
  form: UseFormReturn<T>
) => {
  const baselineRef = useRef<T | undefined>(undefined);
  const { defaultValues } = form.formState;

  useEffect(() => {
    baselineRef.current = structuredClone(form.getValues());
  }, [form, defaultValues]);

  return useCallback(
    (): T | undefined => baselineRef.current ?? (defaultValues as T | undefined),
    [defaultValues]
  );
};
