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
import { describe, expect, it } from 'vitest';

import { APISIXCommon } from './common';

describe('RefId', () => {
  it.each([
    ['a string', 'up-1', 'up-1'],
    ['an empty string (the cleared form field)', '', ''],
    ['a positive integer, as its decimal string', 10001, '10001'],
  ])('accepts %s', (_, input, expected) => {
    expect(APISIXCommon.RefId.parse(input)).toBe(expected);
  });

  // The gateway's `id_schema` integer branch is `minimum: 1`.
  it.each([0, -1, 1.5, true, null, {}])('rejects %j', (input) => {
    expect(APISIXCommon.RefId.safeParse(input).success).toBe(false);
  });
});

describe('ID', () => {
  // `PUT /apisix/admin/routes` with `"id": 10001` in the body (no id in the
  // URL) stores and returns a numeric primary id.
  it('accepts the integer primary id and normalizes it to a string', () => {
    expect(APISIXCommon.ID.parse({ id: 10001 })).toEqual({ id: '10001' });
  });
});
