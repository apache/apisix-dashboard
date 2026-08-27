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

import { toRefId } from './ref-id';

describe('toRefId', () => {
  it.each([
    ['a string, trimmed', ' up-1 ', 'up-1'],
    ['a number, as its decimal string', 10001, '10001'],
    ['undefined (field not set)', undefined, ''],
    ['null', null, ''],
    ['whitespace only', '   ', ''],
  ])('%s', (_, input, expected) => {
    expect(toRefId(input)).toBe(expected);
  });

  it('resolves nothing for a value that is not an id at all', () => {
    for (const value of [true, {}, [], () => undefined]) {
      expect(toRefId(value)).toBe('');
    }
  });
});
