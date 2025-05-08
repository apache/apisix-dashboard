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

const Labels = z.record(z.string());

const Expr = z.array(z.unknown());

const Status = z.union([z.literal(0), z.literal(1)]);

const Basic = z
  .object({
    name: z.string(),
    desc: z.string(),
    labels: Labels,
    status: Status.optional(),
  })
  .partial();

const ID = z.object({
  id: z.string(),
});

const Timestamp = z.object({
  create_time: z.number(),
  update_time: z.number(),
});

const Info = ID.merge(Timestamp);

const HttpMethod = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('DELETE'),
  z.literal('PATCH'),
  z.literal('HEAD'),
  z.literal('OPTIONS'),
  z.literal('CONNECT'),
  z.literal('TRACE'),
  z.literal('PURGE'),
]);

export const APISIXCommon = {
  Basic,
  Labels,
  Expr,
  ID,
  Timestamp,
  Info,
  HttpMethod,
  Status,
};
