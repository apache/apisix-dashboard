/*
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
import useLatest from '@/hooks/useLatest';
import { useMemo } from 'react';
import { throttle } from 'lodash';
import useUnmount from '@/hooks/useUnmount';

type useThrottleReturn = (...args: any) => any;

interface ThrottleOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
}

function useThrottle<T extends useThrottleReturn>(fn: T, options: ThrottleOptions) {
  const fnRef = useLatest(fn);

  const wait = options?.wait ?? 1000;

  const throttled = useMemo(
    () =>
      throttle(
        (...args: any[]): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  useUnmount(() => {
    throttled.cancel();
  });

  return {
    fn: throttled,
    cancel: throttled.cancel,
    flush: throttled.flush,
  };
}

export default useThrottle;
