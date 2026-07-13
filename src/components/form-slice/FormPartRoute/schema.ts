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

// the FormItemEditor (monaco) is for editing text, and passing the
// original schema of `vars` for validation is not in line with that
// usage — but the text must at least be parseable JSON, because the
// submit pipeline JSON.parses it (produceVarsToAPI) before the request
// is built. Semantic validation of the expression array stays with the
// Admin API, whose 400 error_msg the interceptor already toasts.
const varsJSONString = z
  .string()
  .optional()
  .refine(
    (v) => {
      if (!v || v.trim().length === 0) return true;
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'JSON format is not valid' }
  );

export const RoutePostSchema = APISIX.Route.omit({
  id: true,
  create_time: true,
  update_time: true,
}).extend({
  vars: varsJSONString,
});

export type RoutePostType = z.infer<typeof RoutePostSchema>;

export const RoutePutSchema = APISIX.Route.extend({
  vars: varsJSONString,
});

export type RoutePutType = z.infer<typeof RoutePutSchema>;
