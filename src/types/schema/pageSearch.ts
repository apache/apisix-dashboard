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

export const pageSearchSchema = z
  .preprocess(
    (val: unknown) => {
      if (typeof val === 'object' && val !== null) {
        const obj = val as Record<string, unknown>;
        if ('pageSize' in obj && !('page_size' in obj)) {
          return {
            ...obj,
            page_size: obj.pageSize,
          };
        }
      }
      return val;
    },
    z.object({
      page: z
        .union([z.string(), z.number()])
        .optional()
        .default(1)
        .transform((val) => (val ? Number(val) : 1)),
      page_size: z
        .union([z.string(), z.number()])
        .optional()
        .default(10)
        .transform((val) => (val ? Number(val) : 10)),
      // Common search filter fields used by routes and other pages.
      // Keeping these optional preserves backward compatibility while
      // ensuring URL params are normalized into consistent shapes.
      name: z.string().optional(),
      version: z.string().optional(),
      labels: z
        .preprocess((labelVal) => {
          if (Array.isArray(labelVal)) return labelVal;
          return typeof labelVal === 'string' ? [labelVal] : labelVal;
        }, z.array(z.string()))
        .optional(),
      status: z.union([z.string(), z.number()]).optional(),
    }).passthrough()
  );

export type PageSearchType = z.infer<typeof pageSearchSchema>;
