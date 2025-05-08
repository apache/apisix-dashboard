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
import { produce } from 'immer';
import { all, map, values } from 'rambdax';

import type { APISIXType } from '@/types/schema/apisix';

const allFalsy = (obj: object) =>
  all(
    Boolean,
    map((val) => !val, values(obj))
  );
type hasTimeout = Pick<APISIXType['Route'], 'timeout'>;
export const produceTimeout = produce<Partial<hasTimeout>>((draft) => {
  if (draft.timeout && allFalsy(draft.timeout)) {
    delete draft.timeout;
  }
});

export const produceTime = produce<Partial<APISIXType['Info']>>((draft) => {
  if (draft.create_time) delete draft.create_time;
  if (draft.update_time) delete draft.update_time;
});
