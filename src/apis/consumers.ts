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
import type { AxiosInstance } from 'axios';

import { API_CONSUMERS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getConsumerListReq = (req: AxiosInstance, params: PageSearchType) =>
  req
    .get<unknown, APISIXType['RespConsumerList']>(API_CONSUMERS, {
      params,
    })
    .then((v) => v.data);

export const getConsumerReq = (req: AxiosInstance, username: string) =>
  req
    .get<unknown, APISIXType['RespConsumerDetail']>(
      `${API_CONSUMERS}/${username}`
    )
    .then((v) => v.data);

export const putConsumerReq = (
  req: AxiosInstance,
  data: APISIXType['ConsumerPut']
) => {
  return req.put<APISIXType['ConsumerPut'], APISIXType['RespConsumerDetail']>(
    API_CONSUMERS,
    data
  );
};
