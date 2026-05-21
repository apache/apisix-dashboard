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

/**
 * Best-effort cleanup helper.
 *
 * Some product-side `deleteAll*` helpers (e.g. `deleteAllServices` →
 * `deleteAllStreamRoutes`) fail when the APISIX deployment has stream mode
 * disabled. Cleanup is not the system under test — it must not fail the
 * spec. Use this wrapper in `beforeAll` / `afterAll` so tests focus on the
 * thing they actually want to verify.
 */
export async function safeClean(
  ...fns: Array<() => Promise<unknown>>
): Promise<void> {
  for (const fn of fns) {
    try {
      await fn();
    } catch {
      // Swallow — cleanup failures must not abort the test that owns this
      // hook. Each individual test asserts product behavior on its own.
    }
  }
}
