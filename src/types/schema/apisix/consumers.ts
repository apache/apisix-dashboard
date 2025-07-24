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

import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const Consumer = z
  .object({
    username: z
      .string()
      .min(1)
      // ref: https://github.com/apache/apisix/blob/a2482df74d712228a1a6644662d74d2f51a3f5e6/apisix/schema_def.lua#L713
      .regex(/^[a-zA-Z0-9_-]+$/),
    plugins: APISIXPlugins.Plugins.optional(),
    group_id: z.string().optional(),
  })
  .merge(APISIXCommon.Basic.omit({ name: true }))
  .merge(APISIXCommon.Info.omit({ id: true }));

export const APISIXConsumers = {
  Consumer,
  ConsumerPut: Consumer.omit({
    create_time: true,
    update_time: true,
  }),
};
