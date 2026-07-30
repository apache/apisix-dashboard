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
import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { isNotFoundError } from './error';

// Only `status` is read, so a cast keeps the fixtures readable rather than
// constructing a full AxiosResponse with headers and config.
const withStatus = (status: number) => {
  const err = new AxiosError('request failed');
  err.response = { status } as AxiosResponse;
  return err;
};

describe('isNotFoundError', () => {
  it('accepts an axios error carrying 404', () => {
    expect(isNotFoundError(withStatus(404))).toBe(true);
  });

  it.each([401, 400, 500, 503])('rejects an axios error carrying %i', (status) => {
    expect(isNotFoundError(withStatus(status))).toBe(false);
  });

  it('rejects an axios error with no response at all', () => {
    // network-level failure: unreachable backend, timeout, CORS preflight.
    // There is no status to read, so this is not "does not exist".
    expect(isNotFoundError(new AxiosError('Network Error'))).toBe(false);
  });

  it.each([new Error('boom'), null, undefined, 'Key not found', { status: 404 }])(
    'rejects a non-axios value (%s)',
    (value) => {
      expect(isNotFoundError(value)).toBe(false);
    }
  );
});
