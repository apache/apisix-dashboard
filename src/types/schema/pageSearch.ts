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

/**
 * To deprecate pageSize without modifying existing code, use preprocessing.
 */
export const pageSearchSchema = z.preprocess(
  (data) => {
    // If pageSize is provided but page_size isn't, use pageSize value for page_size
    const inputData = data as Record<string, unknown>;
    if (inputData?.pageSize && inputData?.page_size === undefined) {
      return { ...inputData, page_size: inputData.pageSize };
    }
    return data;
  },
  z
    .object({
      page: z
        .union([z.string(), z.number()])
        .optional()
        .default(1)
        .transform((val) => (val ? Number(val) : 1)),
      pageSize: z
        .union([z.string(), z.number()])
        .optional()
        .default(10)
        .transform((val) => (val ? Number(val) : 10)),
      page_size: z
        .union([z.string(), z.number()])
        .optional()
        .default(10)
        .transform((val) => (val ? Number(val) : 10)),
      name: z.string().optional(),
      label: z.string().optional(),
    })
    .passthrough()
);

export type PageSearchType = z.infer<typeof pageSearchSchema>;
