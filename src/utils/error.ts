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
import { HttpStatusCode, isAxiosError } from 'axios';

/**
 * A 404 from the Admin API means the resource does not exist.
 *
 * Three places must agree on this judgement: the query client (a 404 must
 * not be retried), the response interceptor (a 404 on a read must not
 * toast), and the detail pages' error component (a 404 renders the
 * not-found panel). An axios error with no `response` is a network-level
 * failure, not an absence, and is deliberately excluded.
 */
export const isNotFoundError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound;
