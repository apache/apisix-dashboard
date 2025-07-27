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
import { z } from 'zod';

import { APISIX } from '@/types/schema/apisix';

export const RoutePostSchema = APISIX.Route.omit({
  id: true,
  create_time: true,
  update_time: true,
}).extend({
  // the FormItemEditor (monaco) is for editing text,
  // and passing the original schema of `vars` for validation
  // is not in line with this usage.
  vars: z.string().optional(),
});

export type RoutePostType = z.infer<typeof RoutePostSchema>;

export const RoutePutSchema = APISIX.Route.extend({
  vars: z.string().optional(),
});

export type RoutePutType = z.infer<typeof RoutePutSchema>;
