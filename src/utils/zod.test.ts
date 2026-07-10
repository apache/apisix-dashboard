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
import { z } from 'zod';

import { zOneOf } from './zod';

// Regression for #3296: the original implementation used xor() backwards —
// it rejected the valid "exactly one filled" state and accepted the two
// invalid states (both filled / neither filled).

type Arg = { a?: string; b?: string };

const schema = z
  .object({ a: z.string().optional(), b: z.string().optional() })
  .superRefine(zOneOf<Arg, 'a', 'b'>('a', 'b'));

describe('zOneOf', () => {
  it('passes when only the first key is filled', () => {
    expect(schema.safeParse({ a: 'x' }).success).toBe(true);
    expect(schema.safeParse({ a: 'x', b: undefined }).success).toBe(true);
  });

  it('passes when only the second key is filled', () => {
    expect(schema.safeParse({ b: 'y' }).success).toBe(true);
    expect(schema.safeParse({ a: undefined, b: 'y' }).success).toBe(true);
  });

  it('fails when both keys are filled', () => {
    const res = schema.safeParse({ a: 'x', b: 'y' });
    expect(res.success).toBe(false);
    if (!res.success) {
      // one issue per key so both fields show the error
      expect(res.error.issues.map((i) => i.path[0]).sort()).toEqual([
        'a',
        'b',
      ]);
    }
  });

  it('fails when neither key is filled', () => {
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ a: undefined, b: undefined }).success).toBe(
      false
    );
  });

  it('treats an empty string as not filled', () => {
    // form inputs produce '' rather than undefined when cleared
    expect(schema.safeParse({ a: '', b: 'y' }).success).toBe(true);
    expect(schema.safeParse({ a: '', b: '' }).success).toBe(false);
  });
});
