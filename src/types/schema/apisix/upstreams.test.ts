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

import { APISIXUpstreams } from './upstreams';

describe('UpstreamDiscovery schema', () => {
  it('should preserve arbitrary key-value pairs in discovery_args', () => {
    const input = {
      discovery_type: 'dns',
      service_name: 'my-service',
      discovery_args: {
        group_name: 'my-group',
        namespace_id: 'public',
      },
    };

    const result = APISIXUpstreams.UpstreamDiscovery.parse(input);

    expect(result.discovery_args).toEqual({
      group_name: 'my-group',
      namespace_id: 'public',
    });
  });

  it('should accept discovery_args with nested values', () => {
    const input = {
      discovery_type: 'nacos',
      service_name: 'my-service',
      discovery_args: {
        group_name: 'DEFAULT_GROUP',
        metadata: { version: 'v1', env: 'prod' },
      },
    };

    const result = APISIXUpstreams.UpstreamDiscovery.parse(input);

    expect(result.discovery_args).toEqual({
      group_name: 'DEFAULT_GROUP',
      metadata: { version: 'v1', env: 'prod' },
    });
  });

  it('should accept empty discovery_args', () => {
    const input = {
      discovery_type: 'dns',
      service_name: 'my-service',
      discovery_args: {},
    };

    const result = APISIXUpstreams.UpstreamDiscovery.parse(input);

    expect(result.discovery_args).toEqual({});
  });

  it('should accept missing discovery_args', () => {
    const input = {
      discovery_type: 'dns',
      service_name: 'my-service',
    };

    const result = APISIXUpstreams.UpstreamDiscovery.parse(input);

    expect(result.discovery_args).toBeUndefined();
  });
});
