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

import { REFS, type ResourceRefTarget } from './ResourceRef';

// The `satisfies` on REFS checks the route strings against the generated
// route tree and nothing else: the factory slot is erased to
// `(id: string) => unknown`, which every one of the four factories
// satisfies for every key, so pairing `upstreams` with the *service*
// query compiles clean and ships a link that resolves the wrong resource.
// This is the check the type system cannot make.
//
// The discriminator is the query key: `genDetailQueryOptions(key, ...)`
// (src/apis/hooks.ts) puts its `key` at position 0 of every queryKey it
// builds, so the factory identifies itself without being compared by
// reference.
const EXPECTED: Record<
  ResourceRefTarget,
  { detailQueryKey: string; to: string }
> = {
  upstreams: { detailQueryKey: 'upstream', to: '/upstreams/detail/$id' },
  services: { detailQueryKey: 'service', to: '/services/detail/$id' },
  pluginConfigs: {
    detailQueryKey: 'plugin_config',
    to: '/plugin_configs/detail/$id',
  },
  consumerGroups: {
    detailQueryKey: 'consumer_group',
    to: '/consumer_groups/detail/$id',
  },
};

describe('REFS', () => {
  it('covers exactly the four referenceable resources', () => {
    expect(Object.keys(REFS).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it.each(Object.keys(EXPECTED) as ResourceRefTarget[])(
    '%s pairs its own detail query with its own detail route',
    (resource) => {
      const { detailQueryKey, to } = EXPECTED[resource];
      expect(REFS[resource].getQueryOptions('an-id').queryKey).toEqual([
        detailQueryKey,
        'an-id',
      ]);
      expect(REFS[resource].to).toBe(to);
    }
  );
});
