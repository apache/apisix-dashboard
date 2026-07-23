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

import { produceRmEmptyUpstreamFields } from '@/components/form-slice/FormPartUpstream/util';
import { produceRmUpstreamWhenHas } from '@/utils/form-producer';
import { pipeProduce } from '@/utils/producer';

import type { StreamRoutePostType } from './schema';

/**
 * Shared by BOTH the create and edit paths — stream routes used to be the
 * only resource whose two paths ran different cleaning pipelines (create
 * skipped pipeProduce entirely; edit borrowed the HTTP-route producer).
 * pipeProduce supplies the __-flag removal, empty-value cleaning and
 * empty-plugin restore every other resource gets (#3417).
 */
export const produceStreamRoute = pipeProduce(
  produceRmUpstreamWhenHas('service_id', 'upstream_id'),
  produceRmEmptyUpstreamFields,
  produce((draft: StreamRoutePostType) => {
    // The Admin API accepts a stream-route `name` (kept — the form renders
    // it, and an API-created name must survive an edit-save, #3437 review)
    // but rejects `status` (stripped; the form never renders it, but a
    // reused generic component could introduce it).
    const d = draft as StreamRoutePostType & { status?: number };
    delete d.status;

    // Cleanup protocol if name is missing
    if (draft.protocol && !draft.protocol.name) {
      delete draft.protocol;
    }
  })
);
