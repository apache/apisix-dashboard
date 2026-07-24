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

import { classifyRouteId } from './useDocumentTitle';

// Every route pattern the generated tree actually produces, so a new
// route shape cannot silently fall back to the generic app title.
describe('classifyRouteId', () => {
  it('classifies top-level list / add / detail routes', () => {
    expect(classifyRouteId('/routes/')).toEqual({
      label: 'routes',
      action: 'list',
    });
    expect(classifyRouteId('/routes/add')).toEqual({
      label: 'routes',
      action: 'add',
    });
    expect(classifyRouteId('/routes/detail/$id')).toEqual({
      label: 'routes',
      action: 'detail',
    });
    expect(classifyRouteId('/consumer_groups/detail/$id')).toEqual({
      label: 'consumerGroups',
      action: 'detail',
    });
    expect(classifyRouteId('/stream_routes/add')).toEqual({
      label: 'streamRoutes',
      action: 'add',
    });
  });

  // #3441 review: /secrets/detail/$manager/$id ends with TWO params, so a
  // check that only looked at the second-to-last segment fell through to
  // the list branch, picked $manager as the resource and returned null —
  // the page got the generic application title.
  it('classifies a detail route with multiple trailing params', () => {
    expect(classifyRouteId('/secrets/detail/$manager/$id')).toEqual({
      label: 'secrets',
      action: 'detail',
    });
  });

  it('classifies nested resources by their own leaf, not the parent', () => {
    expect(classifyRouteId('/services/detail/$id/routes/')).toEqual({
      label: 'routes',
      action: 'list',
    });
    expect(classifyRouteId('/services/detail/$id/routes/add')).toEqual({
      label: 'routes',
      action: 'add',
    });
    expect(
      classifyRouteId('/services/detail/$id/routes/detail/$routeId')
    ).toEqual({ label: 'routes', action: 'detail' });
    expect(
      classifyRouteId('/services/detail/$id/stream_routes/detail/$routeId')
    ).toEqual({ label: 'streamRoutes', action: 'detail' });
    expect(classifyRouteId('/consumers/detail/$username/credentials/add')).toEqual(
      { label: 'credentials', action: 'add' }
    );
    expect(
      classifyRouteId('/consumers/detail/$username/credentials/detail/$id')
    ).toEqual({ label: 'credentials', action: 'detail' });
  });

  it('still classifies the parent detail page itself', () => {
    expect(classifyRouteId('/services/detail/$id/')).toEqual({
      label: 'services',
      action: 'detail',
    });
    expect(classifyRouteId('/consumers/detail/$username/')).toEqual({
      label: 'consumers',
      action: 'detail',
    });
  });

  it('returns null for routes outside the resource sections', () => {
    expect(classifyRouteId('/')).toBeNull();
    expect(classifyRouteId('/__root__')).toBeNull();
  });
});
