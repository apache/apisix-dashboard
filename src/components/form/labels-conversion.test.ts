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

import {
  labelsToTags,
  parseLabelTag,
  tagsToLabels,
} from './labels-conversion';

// Regression for a data-integrity item of #3417: the Labels widget split
// every tag on EVERY colon and required exactly two parts, so a label
// value containing a colon (registry addresses, times, ratios — accepted
// and stored by the Admin API, verified live) could not be typed in, and
// its mere presence made every subsequent edit of the tag set error out
// and be discarded. New-input parsing splits on the FIRST colon; strings
// that match an existing entry's joined form keep that entry verbatim, so
// stored labels (including colon-in-KEY ones, which the API also accepts)
// are never silently rewritten by edits to other tags.

describe('parseLabelTag', () => {
  it('splits on the first colon only', () => {
    expect(parseLabelTag('registry:docker.io:5000')).toEqual([
      'registry',
      'docker.io:5000',
    ]);
  });

  it('accepts a plain key:value pair', () => {
    expect(parseLabelTag('env:prod')).toEqual(['env', 'prod']);
  });

  it('rejects a tag without a colon', () => {
    expect(parseLabelTag('env')).toBeNull();
  });

  it('rejects empty key or value (the Admin API rejects them with 400)', () => {
    expect(parseLabelTag(':prod')).toBeNull();
    expect(parseLabelTag('env:')).toBeNull();
  });
});

describe('tagsToLabels', () => {
  it('parses new colon-value input by first colon', () => {
    expect(tagsToLabels(['registry:docker.io:5000'], {})).toEqual({
      registry: 'docker.io:5000',
    });
  });

  it('keeps existing entries verbatim when other tags change', () => {
    const current = { 'a:b': 'c', env: 'prod' };
    expect(tagsToLabels(['a:b:c', 'env:prod', 'team:gw'], current)).toEqual({
      'a:b': 'c',
      env: 'prod',
      team: 'gw',
    });
  });

  it('supports removing a tag without disturbing colon-key survivors', () => {
    const current = { 'a:b': 'c', env: 'prod' };
    expect(tagsToLabels(['a:b:c'], current)).toEqual({ 'a:b': 'c' });
  });

  it('returns null for invalid new input', () => {
    expect(tagsToLabels(['nocolon'], {})).toBeNull();
    expect(tagsToLabels(['env:'], {})).toBeNull();
  });

  it('tolerates a non-object current value', () => {
    expect(tagsToLabels(['env:prod'], undefined)).toEqual({ env: 'prod' });
    expect(tagsToLabels(['env:prod'], ['array'])).toEqual({ env: 'prod' });
  });
});

describe('labelsToTags', () => {
  it('joins entries with a colon', () => {
    expect(labelsToTags({ registry: 'docker.io:5000' })).toEqual([
      'registry:docker.io:5000',
    ]);
  });

  it('returns [] for non-object values', () => {
    expect(labelsToTags(undefined)).toEqual([]);
    expect(labelsToTags(['x'])).toEqual([]);
    expect(labelsToTags(null)).toEqual([]);
  });
});
