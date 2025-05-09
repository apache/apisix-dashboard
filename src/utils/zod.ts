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
import { xor } from 'rambdax';
import { type RefinementCtx, z } from 'zod';
import { init } from 'zod-empty';

// ref: https://github.com/colinhacks/zod/issues/61#issuecomment-1741983149
export const zOneOf =
  <
    A,
    K1 extends Extract<keyof A, string>,
    K2 extends Extract<keyof A, string>,
    R extends A &
      (
        | (Required<Pick<A, K1>> & { [P in K2]: undefined })
        | (Required<Pick<A, K2>> & { [P in K1]: undefined })
      )
  >(
    key1: K1,
    key2: K2
  ): ((arg: A, ctx: RefinementCtx) => arg is R) =>
  (arg, ctx): arg is R => {
    if (xor(arg[key1] as boolean, arg[key2] as boolean)) {
      [key1, key2].forEach((key) => {
        ctx.addIssue({
          path: [key],
          code: z.ZodIssueCode.custom,
          message: `Either '${key1}' or '${key2}' must be filled, but not both`,
        });
      });
      return false;
    }
    return true;
  };

export const zGetDefault = init;
