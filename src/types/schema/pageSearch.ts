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


// Search params come from the URL and can be arbitrary garbage
// (hand-edited, stale bookmarks, duplicated keys parsed as arrays).
// `catch` degrades every invalid shape to the default instead of sending
// NaN to the Admin API or throwing a ZodError out of validateSearch.
export const pageSearchSchema = z
  .object({
    page: z.coerce.number().int().min(1).catch(1),
    page_size: z.coerce.number().int().min(1).catch(10),
    name: z.string().optional(),
    label: z.string().optional(),
  })
  .passthrough();

export type PageSearchType = z.infer<typeof pageSearchSchema>;
